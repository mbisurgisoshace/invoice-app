import Image from "next/image";

import HeroImg from "@/public/hero.png";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center py-12 lg:py-20">
      <div className="text-center">
        <span className="text-sm text-primary font-medium tracking-tight bg-primary/10 px-4 py-2 rounded-full">
          Introducing Invoicely
        </span>
        <h1 className="mt-8 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter">
          Invoice Smart.{" "}
          <span className="block -mt-2 text-primary">Get Paid Fast.</span>
        </h1>

        <p className="max-w-xl text-center mx-auto mt-4 lg:text-lg text-muted-foreground">
          Creating invoices can be a pain! We at Invoicely make it super easy
          for you to get paid in time!
        </p>
      </div>

      <div className="relative items-center w-full py-12 mx-auto mt-12">
        <Image
          src={HeroImg}
          alt="Hero"
          className="relative object-cover w-full border rounded-lg lg:rounded-2xl shadow-2xl"
        />
      </div>
    </section>
  );
}
