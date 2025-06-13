import React from "react";
import { Card } from "flowbite-react";

const offices = [
  {
    title: "SVYM Registered Office",
    address: [
      "CA2, KIADB Industrial Housing Area",
      "Ring Road, Hebbal",
      "Mysuru, Karnataka, India - 570016",
    ],
    phone: "+91 96866 66313",
    maps: "https://maps.app.goo.gl/22TECHjvJDC1WhHM7",
  },
  {
    title: "SVYM Administrative Office",
    address: [
      "Hanchipura Road, Saragur Taluk",
      "Mysuru District, Karnataka, India - 571121",
    ],
    phone: "+91 96866 66312",
    maps: "https://maps.app.goo.gl/aoWxRqJScH4iHfLcA",
  },
  {
    title: "SVYM Bengaluru Regional Office",
    address: [
      "DVG Bhavana, Ghokale Institute of Public Affairs",
      "No. 2/86/1- A, 5th Main, Bull Temple Road",
      "N. R. Colony, Bengaluru, Karnataka, India - 560004",
    ],
    phone: "+91 968 6666 312",
    maps: "https://maps.app.goo.gl/UbqFGcGD4tovedE98",
  },
  {
    title: "SVYM Hassan Regional Office",
    address: [
      "#163, LIG, Channapatna Housing Board Colony",
      "Near New KSRTC Bus Stand, Hassan, Karnataka - 573201",
    ],
    phone: "+91 99000 20487",
  },
  {
    title: "SVYM Dharwad Regional Office",
    address: [
      "Tudayekar Compound, Near Jambagi Hospital",
      "Sadhanakeri, Dharwad, Karnataka - 580008",
    ],
    phone: "+91 96866 31091",
    maps: "https://maps.app.goo.gl/Pr6NH3pdMEeQPEHs7",
  },
  {
    title: "SVYM Raichur Regional Office",
    address: [
      "1-11-236, Nijalingappa Colony",
      "Near ATM Circle, Raichur, Karnataka, India - 584101",
    ],
    phone: "08532469276",
    maps: "https://maps.app.goo.gl/d5ayeQFTA7r2B65GA",
  },
  {
    title: "SVYM Kodagu Regional Office",
    address: [
      "29/1B, Bhishma Nilaya, 8th Block",
      "Cauvery Layout, Madikeri, Karnataka, India - 571201",
    ],
    phone: "+91 99641 03322",
    maps: "https://maps.app.goo.gl/RPVGbBfmREPiPveb6",
  },
];

export const HelpCenter = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Help Center</h1>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {offices.map((office, idx) => (
          <Card key={idx} className="shadow-md">
            <h2 className="text-xl font-semibold mb-2">{office.title}</h2>
            <p className="mb-1 whitespace-pre-line">
              {office.address.join("\n")}
            </p>
            <p className="mb-1 font-medium">📞 {office.phone}</p>
            {office.maps && (
              <a
                href={office.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                View on Google Maps
              </a>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
