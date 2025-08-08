import CategoryTabs from "~/components/cateogry-tabs/CategoryTabs";

function categories() {
  return (
    <section
      dir="rtl"
      id="Categories"
      //
    >
      <CategoryTabs />
      <div className=" @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 lg:px-6"></div>
    </section>
  );
}

export default categories;
