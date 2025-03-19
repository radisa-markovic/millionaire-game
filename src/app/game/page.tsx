"use client";
import { useEffect, useRef, useState } from "react";
import { clsx } from 'clsx';
// import finalAnswer from "/sounds/final-answer.mp3"; don't import it, use it directly, read the docs
import useSound from "use-sound";
import Question from "@/models/Question";
import { testQuestions } from "@/data/questions";

export default function Game()
{
    const [questionNumber, setQuestionNumber] = useState<number>(0);
    const [question, setQuestion] = useState<Question>(testQuestions[0]);
    const [answerIsGiven, setAnswerIsGiven] = useState<boolean>(false);
    const [givenAnswer, setGivenAnswer] = useState<string>('');
    
    const answersHolder = useRef<HTMLUListElement>(null);
    const correctAnswerButton = useRef<HTMLButtonElement>(null);

    const [allAnswers, setAllAnswers] = useState<(string | number)[]>([]);
    
    useEffect(()=>{
        setAllAnswers(shuffleArray(question.incorrectAnswers.concat(question.correctAnswer)));
    },[questionNumber]);

    const [playFirstSixQuestionsBGMusic, { stop: stopFirstBGMusic }] = useSound("/sounds/first-six-questions-bg-music.mp3");
    const [playAnswerGivenMusic, { stop }] = useSound("/sounds/final-answer.mp3");
    const [playWrongAnswerMusic, { stop: stopWrongAnswerMusic }] = useSound("/sounds/wrong-answer.mp3");
    const [playCorrectAnswerMusic, { stop: stopCorrectAnswerMusic }] = useSound("/sounds/correct-answer.mp3");

    const buttonClass: string = "text-white bg-black w-full text-xl py-3";
    const answerGivenClasses: string = "text-black bg-amber-300 w-full text-xl py-3";
    const hoverClasses: string = "hover:bg-amber-300 hover:text-black hover:cursor-pointer";
    
    const DELAY_FOR_ANSWER_MS: number = 4_000;

    const onAnswerClick = (event: any) => {
        playAnswerGivenMusic();
        const { value: chosenAnswer } = event.target;
        setGivenAnswer(chosenAnswer);
        setAnswerIsGiven(true);
        stopFirstBGMusic();

        setTimeout(() => {
            stop();
            flashCorrectAnswer();
            if(chosenAnswer === question.correctAnswer)
            {
                playCorrectAnswerMusic();
                setTimeout(()=>{
                    setQuestionNumber((oldQuestionNumber) => {
                        return oldQuestionNumber + 1;
                    });
                    setQuestion(testQuestions[questionNumber + 1]);
                    setAnswerIsGiven(false);
                    setGivenAnswer('');
                    correctAnswerButton.current!.style = "";
                }, 4_000);
            }
            else
            {
                playWrongAnswerMusic();
            }
        }, DELAY_FOR_ANSWER_MS);
    }

    const flashCorrectAnswer = () => {
        let intervalID: any;
        let i:number = 0;
        intervalID = setInterval(() => {            
            i % 2 ===0 
            ? correctAnswerButton.current!.style = "background-color: green; color: white"
            : correctAnswerButton.current!.style = "";

            i++;
            if(i === 7) 
            {
                clearInterval(intervalID);
            }
        }, 100);
    }

    function shuffleArray(array: Array<string | number>): Array<string | number> 
    {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i >= 0; i--) 
        {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }

        return shuffledArray;
    }

    return (
        <main>
            <h1 className="text-center text-4xl mb-3">
                New game
            </h1>

            {
                questionNumber === testQuestions.length
                ? 
                <p className="text-center text-5xl">
                    Postali ste milioner!
                </p>
                :
                <section className="text-center w-2/3 ml-auto mr-auto">
                    <h2 
                        className="text-2xl text-white bg-black mb-5 py-8"
                        // style={{
                        //     clipPath: 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)',
                        //     width: '80%',
                        //     marginLeft: 'auto',
                        //     marginRight: 'auto',
                        // }}
                    >
                        {question.text}
                    </h2>
                    <ul className="grid grid-cols-2 gap-2.5" ref={answersHolder}>
                        {allAnswers.map((listedAnswer, key) => (
                            <ol 
                                key={"answer--" + key}
                            >
                                <button
                                    className={givenAnswer === listedAnswer? answerGivenClasses : clsx(buttonClass, !answerIsGiven && hoverClasses)}
                                    onClick={(event) => onAnswerClick(event)}
                                    value={listedAnswer}
                                    disabled={answerIsGiven}
                                    ref={listedAnswer === question.correctAnswer? correctAnswerButton : null}
                                >
                                    { listedAnswer }
                                </button>
                            </ol>
                        ))}
                    </ul>
                </section>
            }
        </main>
    );
}