import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
} from "flowbite-react";

const FaqPage = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-900">
        Frequently Asked Questions
      </h1>

      <Accordion collapseAll>
        <AccordionPanel>
          <AccordionTitle>
            What is Swami Vivekananda Youth Movement (SVYM)?
          </AccordionTitle>
          <AccordionContent>
            <p className="mb-2 text-gray-700">
              SVYM is a development organization based in India that works in
              the areas of health, education, and community development,
              inspired by the values of Swami Vivekananda.
            </p>
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel>
          <AccordionTitle>How can I volunteer or get involved?</AccordionTitle>
          <AccordionContent>
            <p className="mb-2 text-gray-700">
              You can visit SVYM’s official website and apply through their
              volunteer or internship programs. Opportunities are available in
              both fieldwork and research capacities.
            </p>
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel>
          <AccordionTitle>Where does SVYM operate?</AccordionTitle>
          <AccordionContent>
            <p className="mb-2 text-gray-700">
              SVYM operates primarily in Karnataka, India, especially in rural
              and tribal areas, with initiatives in Mysuru, Sargur, and nearby
              regions.
            </p>
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel>
          <AccordionTitle>Is SVYM a government organization?</AccordionTitle>
          <AccordionContent>
            <p className="mb-2 text-gray-700">
              No, SVYM is a non-profit, non-governmental organization (NGO)
              registered under the Societies Registration Act in India.
            </p>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  );
};

export default FaqPage;
