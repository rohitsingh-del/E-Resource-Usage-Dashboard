import { Card } from './ui/Card';
import { BookOpen, School } from 'lucide-react';

// Static mapping data - user can edit this
const schoolMapping = [
    {
        school: "School of Engineering",
        resources: ["IEEE Xplore", "ACM Digital Library", "ScienceDirect", "SpringerLink"]
    },
    {
        school: "School of Business",
        resources: ["Emerald Insight", "Business Source Complete", "ProQuest Central"]
    },
    {
        school: "School of Law",
        resources: ["Manupatra", "SCC Online", "HeinOnline", "LexisNexis"]
    },
    {
        school: "School of Medical & Allied Sciences",
        resources: ["PubMed", "CINAHL", "ClinicalKey"]
    },
    {
        school: "School of Liberal Arts",
        resources: ["JSTOR", "Project MUSE", "Taylor & Francis Online"]
    },
    {
        school: "General / Cross-Disciplinary",
        resources: ["Scopus", "Web of Science", "EBSCOhost", "Cambridge Core"]
    }
];

export const SchoolResourceTable = () => {
    return (
        <Card className="overflow-hidden">
            <div className="mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <School className="text-accent" size={24} />
                    School & Department Resources
                </h2>
                <p className="text-slate-400 text-sm">
                    Breakdown of library resources allocated to specific schools and departments.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="text-xs uppercase bg-slate-800 text-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-3 rounded-tl-lg">School / Department</th>
                            <th scope="col" className="px-6 py-3 rounded-tr-lg">Assigned Resources</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {schoolMapping.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap">
                                    {item.school}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {item.resources.map((res, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                            >
                                                <BookOpen size={10} />
                                                {res}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
