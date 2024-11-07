
export default function Home() {
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-contain py-5 md:py-10">
        <div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2x1:gap-0">
          <div className="flex flex-col justify-center gap-8">
            <h1 className="h1-bold">A Gamified Learning Environment just for you!</h1>
            <p className="p-regular-20 md:p-regular-24">Upload your study notes for any subject or course and generate a quiz fit to your needs. Level up your profile while improving your study.</p>
          </div>
        </div>
      </section>
    </>
  );
}
