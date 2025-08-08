import ServiceCategoryTabs from "~/components/service-category-tabs/ServiceCategoryTabs";

function ServicesPage() {
  return (
    <section id="Services">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">خدماتنا</h1>
        <p className="text-gray-600 mt-2">
          اكتشف مجموعة متنوعة من خدمةنا العالية الجودة لتحسين تجربتك
        </p>
      </div>

      <ServiceCategoryTabs />
    </section>
  );
}

export default ServicesPage;
