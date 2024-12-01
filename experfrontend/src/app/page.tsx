export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl font-extrabold text-white md:text-5xl">
                Learn & Play,
                <span className="block text-yellow-300">Level Up Every Day!</span>
              </h1>
              <p className="text-lg text-white/90 md:text-xl">
                Turn your study notes into exciting quizzes. Earn points, unlock achievements, and make learning fun!
              </p>
              <div className="flex gap-4">
                <a
                  href="/quiz/create"
                  className="transform rounded-full bg-yellow-400 px-8 py-4 text-lg font-bold text-purple-900 shadow-lg transition hover:scale-105 hover:bg-yellow-300"
                >
                  Create Quiz 🎮
                </a>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/assets/images/learning.png"
                alt="Learning"
                className="w-full max-w-md transform rounded-2xl shadow-2xl transition hover:rotate-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Carousel Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-purple-900">
            Popular Quizzes 🌟
          </h2>
          <div className="flex overflow-x-auto pb-8 pt-4 scrollbar-hide">
            <div className="flex gap-6">
              {/* Example Quiz Tiles */}
              <QuizTile
                title="Programming Basics"
                difficulty="Easy"
                questions={10}
                color="bg-green-400"
              />
              <QuizTile
                title="Data Structures"
                difficulty="Medium"
                questions={15}
                color="bg-yellow-400"
              />
              <QuizTile
                title="Algorithms"
                difficulty="Hard"
                questions={20}
                color="bg-red-400"
              />
              <QuizTile
                title="Mathematics"
                difficulty="Easy"
                questions={10}
                color="bg-blue-400"
              />
              <QuizTile
                title="Physics"
                difficulty="Medium"
                questions={15}
                color="bg-purple-400"
              />
              <QuizTile
                title="Chemistry"
                difficulty="Hard"
                questions={20}
                color="bg-pink-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-purple-900">
            Explore Topics 🚀
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <CategoryTile title="Computer Science" icon="💻" color="bg-blue-400" />
            <CategoryTile title="Mathematics" icon="🔢" color="bg-green-400" />
            <CategoryTile title="Physics" icon="⚡" color="bg-yellow-400" />
            <CategoryTile title="Chemistry" icon="🧪" color="bg-pink-400" />
          </div>
        </div>
      </section>
    </div>
  );
}

// Quiz Tile Component
function QuizTile({ title, difficulty, questions, color }: {
  title: string;
  difficulty: string;
  questions: number;
  color: string;
}) {
  return (
    <div className={`${color} flex min-w-[280px] flex-col rounded-2xl p-6 shadow-lg transition hover:scale-105`}>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <div className="mt-4 flex items-center justify-between text-white/90">
        <span>{difficulty}</span>
        <span>{questions} Questions</span>
      </div>
      <button className="mt-4 rounded-full bg-white/20 px-4 py-2 font-semibold text-white backdrop-blur-sm hover:bg-white/30">
        Start Quiz
      </button>
    </div>
  );
}

// Category Tile Component
function CategoryTile({ title, icon, color }: {
  title: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`${color} flex flex-col items-center rounded-2xl p-6 text-center shadow-lg transition hover:scale-105`}>
      <span className="text-4xl">{icon}</span>
      <h3 className="mt-2 font-bold text-white">{title}</h3>
    </div>
  );
}
