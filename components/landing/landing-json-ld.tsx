type OrganizationJsonLdProps = {
  siteUrl: string;
  logoUrl: string;
  description: string;
};

type CourseJsonLdProps = {
  name: string;
  description: string;
  url: string;
};

export function OrganizationJsonLd({ siteUrl, logoUrl, description }: OrganizationJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "EduKids GT",
    url: siteUrl,
    logo: `${siteUrl}${logoUrl}`,
    description,
    address: {
      "@type": "PostalAddress",
      addressCountry: "GT",
    },
    sameAs: [
      "https://www.facebook.com/edukidsguatemala/",
      "https://www.instagram.com/edukids_gt/",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function CourseListJsonLd({ courses, siteUrl }: { courses: CourseJsonLdProps[]; siteUrl: string }) {
  if (courses.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.name,
        description: course.description,
        url: course.url,
        provider: {
          "@type": "Organization",
          name: "EduKids GT",
          url: siteUrl,
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
