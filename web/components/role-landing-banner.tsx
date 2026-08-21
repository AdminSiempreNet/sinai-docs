import { Backpack, BriefcaseBusiness, NotebookPen, type LucideIcon } from 'lucide-react';

const ROLE_BANNER: Record<
  string,
  {
    eyebrow: string;
    Icon: LucideIcon;
  }
> = {
  administrativo: {
    eyebrow: 'Rol Administrativo',
    Icon: BriefcaseBusiness,
  },
  docente: {
    eyebrow: 'Rol Docente',
    Icon: NotebookPen,
  },
  estudiante: {
    eyebrow: 'Rol Estudiante',
    Icon: Backpack,
  },
};

export function RoleLandingBanner({
  role,
  title,
  description,
}: {
  role: string;
  title: string;
  description?: string;
}) {
  const config = ROLE_BANNER[role];
  if (!config) return null;

  const { eyebrow, Icon } = config;

  return (
    <header className="sinai-role-landing-banner" data-role={role}>
      <div className="sinai-role-landing-banner-glow" aria-hidden="true" />
      <div className="sinai-role-landing-banner-content">
        <p className="sinai-role-landing-banner-eyebrow">
          <Icon className="sinai-role-landing-banner-icon" aria-hidden="true" />
          <span>{eyebrow}</span>
        </p>
        <h1 className="sinai-role-landing-banner-title">{title}</h1>
        {description ? (
          <p className="sinai-role-landing-banner-description">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
