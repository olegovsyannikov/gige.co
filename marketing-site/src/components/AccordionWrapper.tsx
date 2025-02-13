'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface Task {
  name: string;
  price: string;
}

interface AccordionItem {
  title: string;
  content: string;
  tasks: Task[];
}

interface AccordionWrapperProps {
  items: AccordionItem[];
}

export function AccordionWrapper({ items }: AccordionWrapperProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border-0">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="w-full text-left">
              <h3 className="text-xl font-semibold text-left">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 text-left">{item.content}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            {item.tasks.map((task, taskIndex) => (
              <div key={taskIndex} className="mb-4 last:mb-0">
                <div className="flex justify-between w-full items-center">
                  <h4 className="text-lg font-medium">{task.name}</h4>
                  <span className="text-sm text-muted-foreground ml-4">{task.price}</span>
                </div>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
} 