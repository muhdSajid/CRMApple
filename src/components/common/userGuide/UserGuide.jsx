import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
} from "flowbite-react";

const UserGuide = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-800">
        User Guide
      </h1>

      <Accordion collapseAll>
        <AccordionPanel>
          <AccordionTitle>How to Register as a New User?</AccordionTitle>
          <AccordionContent>
            <p className="mb-2 text-gray-700">
              Visit the official SVYM website and click on the "Register"
              button. Fill in the required personal and contact information.
              Once submitted, you will receive a confirmation email with login
              credentials.
            </p>
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel>
          <AccordionTitle>How to Access Volunteer Programs?</AccordionTitle>
          <AccordionContent>
            <p className="mb-2 text-gray-700">
              After logging in, navigate to the "Volunteer" section from the
              main menu. You can browse available opportunities, read
              descriptions, and apply directly from the platform.
            </p>
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel>
          <AccordionTitle>
            How to Track My Applications or Participation?
          </AccordionTitle>
          <AccordionContent>
            <p className="mb-2 text-gray-700">
              Go to your profile dashboard and click on the "My Activities" tab.
              Here, you can track the status of your applications, upcoming
              events, and hours contributed.
            </p>
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel>
          <AccordionTitle>How to Contact Support?</AccordionTitle>
          <AccordionContent>
            <p className="mb-2 text-gray-700">
              If you need help, click on the "Help & Support" section. You can
              submit your queries or call us directly at +91 96866 66313 during
              working hours.
            </p>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  );
};

export default UserGuide;
