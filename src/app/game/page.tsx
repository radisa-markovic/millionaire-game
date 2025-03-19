"use client";
import { useEffect, useRef, useState } from "react";
import { clsx } from 'clsx';
// import finalAnswer from "/sounds/final-answer.mp3"; don't import it, use it directly, read the docs
import useSound from "use-sound";
import Question from "@/models/Question";
import { testQuestions } from "@/data/questions";

export default function Game()
{
    const [currentQuestionNumber, setQuestionNumber] = useState<number>(0);
    const [question, setQuestion] = useState<Question>(testQuestions[0]);
    const [answerIsGiven, setAnswerIsGiven] = useState<boolean>(false);
    const [givenAnswer, setGivenAnswer] = useState<string>('');
    const [gameIsOver, setGameIsOver] = useState<boolean>(false);

    //for lifelines
    const [incorrectIndexes, setIncorrectIndexes] = useState<number[]>([]);

    const answerWorthList: string[] = [
        "1.000", "2.000", "3.000", "4.000", "5.000",
        "10.000", "20.000", "40.000", "80.000", "160.000",
        "320.000", "640.000", "1.125.000", "2.500.000", "5.000.000"
    ];
    
    const answersHolder = useRef<HTMLUListElement>(null);
    const correctAnswerButton = useRef<HTMLButtonElement>(null);

    const [allAnswers, setAllAnswers] = useState<(string | number)[]>([]);
    
    useEffect(()=>{
        if(question)
            setAllAnswers(shuffleArray(question.incorrectAnswers.concat(question.correctAnswer)));
    },[currentQuestionNumber]);

    const [playFirstSixQuestionsBGMusic, { stop: stopFirstBGMusic }] = useSound("/sounds/first-six-questions-bg-music.mp3");
    const [playAnswerGivenMusic, { stop }] = useSound("/sounds/final-answer.mp3");
    const [playWrongAnswerMusic, { stop: stopWrongAnswerMusic }] = useSound("/sounds/wrong-answer.mp3");
    const [playCorrectAnswerMusic, { stop: stopCorrectAnswerMusic }] = useSound("/sounds/correct-answer.mp3");

    const buttonClass: string = "text-white bg-black w-full text-xl py-3";
    const answerGivenClasses: string = "text-black bg-amber-300 w-full text-xl py-3";
    const hoverClasses: string = "hover:bg-amber-300 hover:text-black hover:cursor-pointer";
    
    const DELAY_FOR_ANSWER_MS: number = 4_000;

    const onAnswerClick = (event: any) => {
        // playAnswerGivenMusic();
        const { value: chosenAnswer } = event.target;
        setGivenAnswer(chosenAnswer);
        setAnswerIsGiven(true);
        stopFirstBGMusic();

        setTimeout(() => {
            stop();
            flashCorrectAnswer();
            if(chosenAnswer === question.correctAnswer)
            {
                // playCorrectAnswerMusic();
                setTimeout(()=>{
                    setQuestionNumber((oldQuestionNumber) => {
                        return oldQuestionNumber + 1;
                    });
                    setQuestion(testQuestions[currentQuestionNumber + 1]);
                    setAnswerIsGiven(false);
                    setGivenAnswer('');
                    correctAnswerButton.current!.style = "";
                    setIncorrectIndexes([]);
                }, 4_000);
            }
            else
            {
                // playWrongAnswerMusic();
                setGameIsOver(true);
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

    const onNewGameClick = () => {
        setQuestionNumber(0);
        setGameIsOver(false);
        setAnswerIsGiven(false);
        setGivenAnswer('');
        correctAnswerButton.current!.style = "";
    }

    const onFiftyFifty = (helpButton: HTMLButtonElement) => {
        /**
         * 1. find the correct answer button
         * 2. discard two indices who contain incorrect info
         * 3. change button showing based on the index
         * 4. set help is used to false
         */
        helpButton.disabled = true;
        helpButton.style = "text-decoration: line-through;";
        const incorrectIndexes: number[] = [];
        while(incorrectIndexes.length !== 2)
        {
            let randomIndex: number = Math.trunc(Math.random() * 10) % 4;
            if(
                allAnswers[randomIndex] !== question.correctAnswer &&
                incorrectIndexes[0] !== randomIndex
            )
                incorrectIndexes.push(randomIndex);
        }

        setIncorrectIndexes(incorrectIndexes);
    }

    const onAskAudience = () => {
        alert("Ask Audience");
    }

    const onPhoneAFriend = () => {
        alert("Phone a friend");
    }

    return (
        <div className="grid grid-cols-6 bg-blue-950">
            <main className="col-span-5">
                <h1 className="text-center text-4xl mb-3 text-white">
                    New game
                </h1>
                {
                    currentQuestionNumber === testQuestions.length
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
                            {allAnswers.map((listedAnswer, index) => (
                                <ol 
                                    key={"answer--" + index}
                                    className="bg-black"
                                >
                                    {
                                        (index !== incorrectIndexes[0] && index !== incorrectIndexes[1])
                                        && 
                                        <button
                                            className={givenAnswer === listedAnswer? answerGivenClasses : clsx(buttonClass, !answerIsGiven && hoverClasses)}
                                            onClick={(event) => onAnswerClick(event)}
                                            value={listedAnswer}
                                            disabled={answerIsGiven}
                                            ref={listedAnswer === question.correctAnswer? correctAnswerButton : null}
                                        >
                                            { listedAnswer }
                                        </button>
                                    }
                                </ol>
                            ))}
                        </ul>
                    </section>
                }
                {
                    gameIsOver && 
                    <button 
                        onClick={() => onNewGameClick()}
                        className="text-center text-white text-2xl border border-amber-500 block mt-2.5 ml-auto mr-auto hover:cursor-pointer"    
                    >
                        Nova igra
                    </button>
                }
            </main>
            <aside className="col-span-1">
                <section>
                    <h2
                        className="text-white text-2xl"
                    >
                        Pomoći
                    </h2>
                    <div className="grid grid-cols-3">
                        <button
                            onClick={(event) => onFiftyFifty(event.target)}
                            className="text-white"
                        >
                            Pola-pola
                        </button>
                        <button
                            onClick={() => onAskAudience()}
                            className="text-white"
                        >
                            Pomoć publike
                        </button>
                        <button
                            onClick={() => onPhoneAFriend()}
                            className="text-white"
                        >
                            Pozovi prijatelja
                        </button>
                    </div>
                </section>
                <ul>
                    {
                        answerWorthList.toReversed().map((answerPrize, index) => (
                            <li 
                                key={"answerPrize--" + index}
                                className={clsx("text-white", index === (answerWorthList.length - currentQuestionNumber - 1) && "block border border-amber-600")}>
                                {answerPrize}
                            </li>
                        ))
                    }
                </ul>
            </aside>
        </div>
    );
}