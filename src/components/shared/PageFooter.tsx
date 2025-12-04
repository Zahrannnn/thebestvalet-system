import React from 'react';

interface PageFooterProps {
  logo?: string;
  logoAlt?: string;
  companyName?: string;
  copyrightText?: string;
}

export const PageFooter: React.FC<PageFooterProps> = ({
  logo = "/lloogo.png",
  logoAlt = "أفضل خدمة صف سيارات",
  companyName = "أفضل خدمة صف سيارات",
  copyrightText = `© ${new Date().getFullYear()} عبد الرحمن سعد`,
}) => {
  return (
    <footer className="bg-white border-t border-amber-200 p-4 mt-auto">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt={logoAlt} className="h-8 ml-3" />
          <span className="text-sm text-amber-800">{companyName}</span>
        </div>
        <p className="text-sm text-amber-700">{copyrightText}</p>
      </div>
    </footer>
  );
};

