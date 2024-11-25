export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-10 md:py-20">
        <div className="wrapper mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            <div className="flex flex-col justify-center gap-8">
              <h1 className="text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
                A Gamified Learning Environment just for you!
              </h1>
              <p className="text-lg text-gray-700 md:text-xl">
                Upload your study notes for any subject or course and generate a quiz fit to your needs. Level up your profile while improving your study.
              </p>
              <div className="flex gap-4">
                <a
                  href="/quiz"
                  className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                >
                  Get Started
                </a>
                <a
                  href="/quiz"
                  className="inline-block rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
                >
                  Example Button
                </a>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/assets/images/learning.png"
                alt="Learning"
                className="w-full max-w-md rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
