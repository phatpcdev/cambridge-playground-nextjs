import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="font-md text-6xl capitalize">Cambridge dev zone</h1>
        <ul className="text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em] text-blue-400">
            <Link href={"/playground"} className="flex items-center gap-2">
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />{" "}
              Playground
            </Link>
          </li>
          <li className="mb-2 tracking-[-.01em] text-blue-400">
            <Link
              href={"/editor-prototype"}
              className="flex items-center gap-2"
            >
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />{" "}
              Editor Prototype
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
