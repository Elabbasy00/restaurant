import React, { useRef, useState, useEffect } from "react";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useGetCategoryListQuery } from "~/redux/menu-slice/menuSlice";
import ProductCard from "../product-card/ProductCard";
import Loading from "../loading/Loading";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategoryTabs = () => {
  const { data = [], isLoading } = useGetCategoryListQuery();
  const [activeTab, setActiveTab] = useState<string>("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set the first category as active when data loads
  useEffect(() => {
    if (data.length > 0 && !activeTab) {
      setActiveTab(data[0].id.toString());
    }
  }, [data, activeTab]);

  // Check scroll position to show/hide buttons
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Update scroll buttons on mount and when data changes
  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200; // Smaller, more reasonable scroll amount
      const currentScroll = scrollContainerRef.current.scrollLeft;

      const targetScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });

      // Update button states after scroll
      setTimeout(checkScrollButtons, 300);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No categories available</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="relative mb-6">
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => handleScroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => handleScroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        <div className="overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto px-8 py-4 scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
            onScroll={checkScrollButtons}
          >
            {data.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id.toString())}
                className={`flex flex-col items-center min-w-[90px] p-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-accent/50 ${
                  activeTab === category.id.toString()
                    ? "scale-105 bg-accent/30"
                    : "hover:scale-102"
                }`}
              >
                <Avatar
                  className={`h-16 w-16 border-2 transition-all duration-300 ease-in-out ${
                    activeTab === category.id.toString()
                      ? "border-primary shadow-lg"
                      : "border-transparent"
                  }`}
                >
                  <AvatarImage
                    src={category.image}
                    alt={category.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-sm font-semibold">
                    {category.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`text-sm font-medium text-center mt-2 transition-colors duration-200 ${
                    activeTab === category.id.toString()
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products grid for each category */}
      {data.map((category) => (
        <TabsContent
          key={category.id}
          value={category.id.toString()}
          className="mt-0"
        >
          {category.product_category && category.product_category.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {category.product_category.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                لا يوجد منتجات في هذه الفئة
              </p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CategoryTabs;
