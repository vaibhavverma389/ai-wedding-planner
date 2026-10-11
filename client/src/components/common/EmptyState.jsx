import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button.jsx';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No Listings Found',
  description = 'Try adjusting your search criteria, dates, or city filter.',
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-ivory-200 shadow-sm max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-ivory-100 flex items-center justify-center mb-4 text-maroon-800">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">{title}</h3>
      <p className="text-sm text-stone-600 mb-6 leading-relaxed">{description}</p>
      {actionText && actionLink && (
        <Link to={actionLink}>
          <Button variant="primary">{actionText}</Button>
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
