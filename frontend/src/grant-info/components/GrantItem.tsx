import React, {useState} from 'react';
import './styles/GrantItem.css';

interface GrantItemProps {
    grantName: string;
    applicationDate: string;
    generalStatus: string;
    amount: number;
    restrictionStatus: string;
}
const GrantItem: React.FC<GrantItemProps> = (props) => {
   const { grantName, applicationDate, generalStatus, amount, restrictionStatus } = props;

   const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        // class name with either be grant-item or grant-item-expanded
        <div className='grant-item-wrapper'>
            <ul className={`grant-summary ${isExpanded ? 'expanded' : ''}`} onClick={toggleExpand}>
                <li className="grant-name">{grantName}</li>
                <li className="application-date">{applicationDate}</li>
                <li className="status">{generalStatus}</li>
                <li className="amount">${amount}</li>
                <li className="restriction-status">{restrictionStatus}</li>
            </ul>
            <div className={`grant-body ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded && (
                    <div className="grant-description">
                        <h2>Grant Description:</h2>
                                <p>
                                    The Community Development Initiative Grant is designed to empower
                                    local organizations in implementing impactful projects that address
                                    critical social and economic issues. This grant focuses on fostering
                                    community-led programs that aim to improve educational
                                    opportunities, enhance public health services, and support economic
                                    development within underserved areas. Applicants are encouraged to
                                    outline how their proposed projects will contribute to sustainable
                                    growth, promote equity, and engage local stakeholders.
                                </p>
                                <p>
                                    Eligible programs include those that offer job training and
                                    workforce development, youth mentorship, health and wellness
                                    programs, and initiatives aimed at reducing environmental impacts.
                                    Each application should include a detailed plan that highlights the
                                    project’s goals, implementation strategies, and measurable outcomes.
                                    Projects that demonstrate strong community involvement and
                                    partnerships with other local organizations will be prioritized for
                                    funding.
                                </p>
                                <p>
                                    Funding for this grant may cover program expenses such as staffing,
                                    equipment, training materials, and outreach activities. The review
                                    committee seeks innovative and sustainable approaches that align
                                    with the mission of strengthening communities and fostering
                                    long-term positive change. Grant recipients will also be expected to
                                    submit periodic reports outlining the progress and achievements of
                                    their projects over the funding period.
                                </p>

                        </div>
                    )}
            </div>

        </div>

    )
}

export default GrantItem;