export function SectionLandingBanner({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="sinai-section-landing-banner">
      <div className="sinai-section-landing-banner-bar" aria-hidden="true" />
      <div className="sinai-section-landing-banner-content">
        <h1 className="sinai-section-landing-banner-title">{title}</h1>
        {description ? (
          <p className="sinai-section-landing-banner-description">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
