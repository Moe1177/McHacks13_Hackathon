import React from "react";

interface Contact {
  name: string;
  company: string;
  email: string;
  generateddesc: string;
}

interface RepsTableProps {
  contacts: Contact[];
}

export const RepsTable: React.FC<RepsTableProps> = ({ contacts }) => {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Company
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Email
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Generated Description
            </th>
          </tr>
        </thead>

        <tbody>
          {contacts.map((contact, index) => (
            <tr
              key={index}
              className="border-b border-slate-100 hover:bg-slate-50 transition"
            >
              <td className="px-6 py-4 text-sm text-slate-900">
                {contact.name}
              </td>
              <td className="px-6 py-4 text-sm text-slate-700">
                {contact.company}
              </td>
              <td className="px-6 py-4 text-sm text-green-700 underline">
                {contact.email}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {contact.generateddesc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
