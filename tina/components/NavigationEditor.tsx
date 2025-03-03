import React, { useState, useEffect } from 'react';
import { Form, Field } from 'tinacms';
import navigationApi from '../api/navigation';

// Types pour la navigation
interface NavigationLink {
  text: string;
  href: string;
  links?: NavigationLink[];
  variant?: string;
  ariaLabel?: string;
  icon?: string;
}

interface NavigationGroup {
  title?: string;
  links: NavigationLink[];
}

interface NavigationData {
  header: {
    links: NavigationLink[];
    mobileLinks: { links: NavigationLink[] }[];
    actions: NavigationLink[];
  };
  footer: {
    links: NavigationGroup[];
    mobileLinks: { links: NavigationLink[] }[];
    legalLinks: NavigationLink[];
    socialLinks: NavigationLink[];
    footNote: string;
    ecoDesignBadge: {
      text: string;
      icon: string;
      details: string;
      href: string;
    };
  };
}

// Composant d'édition de la navigation
const NavigationEditor: React.FC = () => {
  const [navigation, setNavigation] = useState<NavigationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données de navigation
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const data = await navigationApi.getNavigation();
        setNavigation(data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement de la navigation');
        setLoading(false);
      }
    };

    fetchNavigation();
  }, []);

  // Gérer la soumission du formulaire
  const handleSubmit = async (values: NavigationData) => {
    try {
      await navigationApi.updateNavigation(values);
      alert('Navigation mise à jour avec succès !');
    } catch (err) {
      alert('Erreur lors de la mise à jour de la navigation');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;
  if (!navigation) return <div>Aucune donnée de navigation trouvée</div>;

  return (
    <div className="tina-navigation-editor">
      <h1>Éditeur de Navigation</h1>
      <Form
        onSubmit={handleSubmit}
        initialValues={navigation}
      >
        {/* Onglets pour Header et Footer */}
        <div className="tabs">
          <div className="tab-header">
            <h2>Header</h2>
          </div>
          <div className="tab-content">
            {/* Liens principaux */}
            <h3>Liens principaux</h3>
            <Field name="header.links" component="group-list" label="Liens principaux">
              {({ input, meta, field }) => (
                <div>
                  {input.value.map((link: NavigationLink, index: number) => (
                    <div key={index} className="link-item">
                      <Field name={`header.links[${index}].text`} component="text" label="Texte" />
                      <Field name={`header.links[${index}].href`} component="text" label="Lien" />
                      
                      {/* Sous-liens */}
                      {link.links && (
                        <div className="sublinks">
                          <h4>Sous-liens</h4>
                          <Field name={`header.links[${index}].links`} component="group-list" label="Sous-liens">
                            {({ input: subInput, meta: subMeta, field: subField }) => (
                              <div>
                                {subInput.value.map((sublink: NavigationLink, subIndex: number) => (
                                  <div key={subIndex} className="sublink-item">
                                    <Field name={`header.links[${index}].links[${subIndex}].text`} component="text" label="Texte" />
                                    <Field name={`header.links[${index}].links[${subIndex}].href`} component="text" label="Lien" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </Field>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Field>

            {/* Liens mobiles */}
            <h3>Liens mobiles</h3>
            {/* ... Similaire aux liens principaux ... */}

            {/* Boutons d'action */}
            <h3>Boutons d'action</h3>
            {/* ... Similaire aux liens principaux ... */}
          </div>

          <div className="tab-header">
            <h2>Footer</h2>
          </div>
          <div className="tab-content">
            {/* Colonnes de liens */}
            <h3>Colonnes de liens</h3>
            {/* ... Similaire aux liens principaux ... */}

            {/* Liens légaux */}
            <h3>Liens légaux</h3>
            {/* ... Similaire aux liens principaux ... */}

            {/* Réseaux sociaux */}
            <h3>Réseaux sociaux</h3>
            {/* ... Similaire aux liens principaux ... */}

            {/* Note de bas de page */}
            <h3>Note de bas de page</h3>
            <Field name="footer.footNote" component="textarea" label="Note de bas de page" />

            {/* Badge éco-conception */}
            <h3>Badge éco-conception</h3>
            <Field name="footer.ecoDesignBadge.text" component="text" label="Texte" />
            <Field name="footer.ecoDesignBadge.icon" component="text" label="Icône" />
            <Field name="footer.ecoDesignBadge.details" component="text" label="Détails" />
            <Field name="footer.ecoDesignBadge.href" component="text" label="Lien" />
          </div>
        </div>

        <button type="submit">Enregistrer les modifications</button>
      </Form>
    </div>
  );
};

export default NavigationEditor; 