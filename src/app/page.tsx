import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="text-center text-4xl">
        Milioner igrica
      </h1>      
      <div className="text-center">
        <Link 
          href="/game"
          className="text-white bg-blue-400 px-1 py-2 mt-2 block"
        >
          Nova igra
        </Link>
      </div>
    </div>
  );
}
