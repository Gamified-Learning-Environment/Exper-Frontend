export default function Home() {
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-contain py-10 md:py-20">
        <div className="wrapper mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            <div className="flex flex-col justify-center gap-8">
              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                A Gamified Learning Environment just for you!
              </h1>
              <p className="text-lg text-gray-700 md:text-xl">
                Upload your study notes for any subject or course and generate a quiz fit to your needs. Level up your profile while improving your study.
              </p>
              <div>
                <a
                  href="/quiz"
                  className="inline-block rounded-md bg-blue-600 px-6 py-3 text-lg font-medium text-white hover:bg-blue-700"
                >
                  Get Started
                </a>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/assets/images/learning.png"
                alt="Learning"
                className="w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
