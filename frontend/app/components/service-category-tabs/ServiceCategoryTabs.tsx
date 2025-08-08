import React, { useState } from "react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useGetServiceCategoriesQuery } from "~/redux/services/serviceApi";
import ServiceCard from "../service-card/ServiceCard";

const ServiceCategoryTabs = () => {
  const { data = [], isLoading } = useGetServiceCategoriesQuery();
  const [activeTab, setActiveTab] = useState(data?.[0]?.id?.toString());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">لا توجد فئات خدمة متاحة</p>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue={data?.[0]?.id?.toString()}
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="relative mb-6">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="h-auto p-2 bg-transparent">
            {data.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id.toString()}
                className="flex flex-col items-center min-w-[80px] data-[state=active]:scale-110 data-[state=active]:shadow-none duration-300 ease-in-out transition-all"
              >
                <Avatar
                  className="h-16 w-16 border-2 transition-all duration-200 ease-in-out"
                  style={{
                    borderColor:
                      activeTab === category.id.toString()
                        ? "var(--primary)"
                        : "transparent",
                  }}
                >
                  <AvatarImage src={category.image} alt={category.name} />
                  <AvatarFallback>
                    {category.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-center mt-2">
                  {category.name}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>

      {/* Services grid for each category */}
      {data.map((category) => (
        <TabsContent
          key={category.id}
          value={category.id.toString()}
          className="mt-0"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {category.services?.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {(!category.services || category.services.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد خدمات متاحة في هذه الفئة</p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ServiceCategoryTabs;
