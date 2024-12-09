import React from 'react';
import './styles/GrantDetails.css';

const GrantDetails: React.FC = ()  => {
  return (
    <div className="grant-details">
      <h3>Description</h3>
      <p>
        The Community Development Initiative Grant is designed to empower
        local organizations in implementing impactful projects that address
        critical social and economic issues. This grant focuses on fostering
        community-led programs that aim to improve educational opportunities, 
        enhance public health services, and support economic development within 
        underserved areas. Applicants are encouraged to outline how their proposed 
        projects will contribute to sustainable growth, promote equity, and engage 
        local stakeholders.
      </p>

      <h3>Application Requirements</h3>
      <p>
        Eligible programs include those that offer job training and workforce development, 
        youth mentorship, health and wellness programs, and initiatives aimed at reducing 
        environmental impacts. Each application should include a detailed plan that highlights 
        the project’s goals, implementation strategies, and measurable outcomes. Projects that 
        demonstrate strong community involvement and partnerships with other local organizations 
        will be prioritized for funding.
      </p>

      <h3>Additional Notes</h3>
      <p>
        Funding for this grant may cover program expenses such as staffing, equipment, training 
        materials, and outreach activities. The review committee seeks innovative and sustainable 
        approaches that align with the mission of strengthening communities and fostering long-term 
        positive change. Grant recipients will also be expected to submit periodic reports outlining 
        the progress and achievements of their projects over the funding period.
      </p>
    </div>
  );
}

export default GrantDetails;
