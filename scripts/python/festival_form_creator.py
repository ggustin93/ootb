"""
# Standardisation des formulaires d'inscription

Pour améliorer la collecte de données et faciliter l'organisation du festival, nous proposons d'ajouter trois questions standardisées à tous les formulaires (stands, ateliers et conférences) :

1. **Public cible** : Permet de savoir précisément à qui s'adresse la proposition
   - Jeunes enfants
   - Parents et enfants
   - Parents
   - Professeurs, parents et enfants
   - Professeurs
   - Professionnels

2. **Niveau d'enseignement** : Précise le niveau scolaire concerné
   - Maternelle
   - Primaire
   - Secondaire
   - Maternelle et primaire
   - Primaire et secondaire
   - Maternelle-primaire et secondaire

3. **Type d'enseignement** : Spécifie le contexte éducatif
   - Enseignement ordinaire
   - Enseignement spécialisé
   - Enseignement ordinaire et spécialisé

Avantages de cette standardisation :
- Meilleure catégorisation des propositions
- Facilité de tri et d'organisation du programme
- Vue d'ensemble claire de l'offre par public et niveau
- Possibilité de proposer des parcours personnalisés aux visiteurs
"""

import requests
import os
from dotenv import load_dotenv
from typing import Dict, Any, Optional
import logging
import coloredlogs

# Configuration du logging avec couleurs
coloredlogs.install(
    level=logging.INFO,
    fmt='%(asctime)s - %(levelname)s - %(message)s',
    level_styles={
        'debug': {'color': 'green'},
        'info': {'color': 'blue'},
        'warning': {'color': 'yellow', 'bold': True},
        'error': {'color': 'red', 'bold': True},
        'critical': {'color': 'red', 'bold': True, 'background': 'white'}
    },
    field_styles={
        'asctime': {'color': 'green'},
        'levelname': {'color': 'white', 'bold': True},
        'message': {'color': 'white'}
    }
)

logger = logging.getLogger(__name__)

class NocoDBError(Exception):
    """Classe personnalisée pour les erreurs NocoDB"""
    pass

class FestivalFormCreator:
    FORM_TYPES = {
        'stands': {
            'table_name': 'Stands_Festival',
            'title': 'Stands Festival',
            'form_title': 'Proposez un stand',
            'description': ('Les inscriptions en tant qu\'exposant pour l\'édition de 2025 sont ouvertes. '
                          'N\'hésitez pas à nous contacter afin de connaitre les conditions: alexia@festivalootb.com .\n\n'
                          'Merci de décrire votre stand ci-dessous afin que notre équipe puisse l\'intégrer au programme du Festival.'),
            'help_text': 'Les organisateurs vous communiqueront les infos rapidement.',
            'sections': {
                'about_you': 'À propos de vous:',
                'about_stand': 'Décrivez votre stand:'
            },
            'banner_image': {
                "mimetype": "image/png",
                "path": "download/noco/banner/festival-banner.png",
                "size": 48128,
                "title": "Festival Out of the Books - Stands",
                "url": "https://static.wixstatic.com/media/e57c2b_aeaad596d9cb4ebcbe690b7b61109fcd~mv2.png"
            }
        },
        'ateliers': {
            'table_name': 'Ateliers_Festival',
            'title': 'Ateliers Festival',
            'form_title': 'Proposez un atelier ou une animation',
            'description': ('Merci de décrire votre animation ci-dessous afin que notre équipe puisse l\'intégrer au programme du Festival.'),
            'help_text': 'Les organisateurs vous communiqueront les horaires rapidement.',
            'sections': {
                'about_you': 'À propos de vous:',
                'about_workshop': 'Décrivez votre animation:'
            },
            'banner_image': {
                "mimetype": "image/png",
                "path": "download/noco/banner/festival-banner.png",
                "size": 48128,
                "title": "Festival Out of the Books - Ateliers",
                "url": "https://static.wixstatic.com/media/e57c2b_aeaad596d9cb4ebcbe690b7b61109fcd~mv2.png"
            }
        },
        'conferences': {
            'table_name': 'Conferences_Festival',
            'title': 'Conférences Festival',
            'form_title': 'Proposez une conférence',
            'description': ('Merci de décrire votre conférence ci-dessous afin que notre équipe puisse l\'intégrer au programme du Festival.'),
            'help_text': 'Les organisateurs vous communiqueront les horaires rapidement.',
            'sections': {
                'about_you': 'À propos de vous:',
                'about_conference': 'Décrivez votre conférence:'
            },
            'banner_image': {
                "mimetype": "image/png",
                "path": "download/noco/banner/festival-banner.png",
                "size": 48128,
                "title": "Festival Out of the Books - Conférences",
                "url": "https://static.wixstatic.com/media/e57c2b_aeaad596d9cb4ebcbe690b7b61109fcd~mv2.png"
            }
        }
    }

    def __init__(self, form_type='stands'):
        # Charger les variables d'environnement
        load_dotenv()
        
        # Vérifier les variables d'environnement requises
        self.base_url = self._get_required_env('NOCODB_BASE_URL').rstrip('/')
        self.base_id = self._get_required_env('NOCODB_BASE_ID')
        self.api_token = self._get_required_env('NOCODB_API_TOKEN')
        
        # Configuration des headers
        self.headers = {
            'xc-token': self.api_token,
            'Content-Type': 'application/json'
        }

        self.form_type = form_type
        self.form_config = self.FORM_TYPES[form_type]

    @staticmethod
    def _get_required_env(var_name: str) -> str:
        """
        Récupère une variable d'environnement requise
        """
        value = os.getenv(var_name)
        if not value:
            raise NocoDBError(f"Variable d'environnement {var_name} manquante")
        return value

    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Effectue une requête HTTP vers l'API NocoDB
        """
        url = f"{self.base_url}/api/v2{endpoint}"
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data if data else None
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur lors de la requête {method} vers {endpoint}: {str(e)}")
            if response := getattr(e, 'response', None):
                logger.error(f"Réponse de l'API: {response.text}")
            raise NocoDBError(f"Erreur API NocoDB: {str(e)}")

    def get_columns(self):
        """Retourne les colonnes selon le type de formulaire"""
        # Champs communs à tous les formulaires
        common_fields = [
            {
                "title": "Prénom",
                "column_name": "firstname",
                "uidt": "SingleLineText",
                "rqd": True,
                "description": "Votre prénom",
                "meta": {
                    "help": "Votre prénom",
                    "placeholder": "Votre prénom"
                }
            },
            {
                "title": "Nom",
                "column_name": "lastname",
                "uidt": "SingleLineText",
                "rqd": True,
                "description": None,
                "meta": {
                    "help": "Votre nom"
                }
            },
            {
                "title": "Email",
                "column_name": "email",
                "uidt": "Email",
                "rqd": True,
                "description": None,
                "meta": {
                    "help": "Votre adresse email"
                }
            },
            {
                "title": "GSM",
                "column_name": "phone",
                "uidt": "PhoneNumber",
                "rqd": True,
                "description": None,
                "meta": {
                    "help": "Votre numéro de téléphone"
                }
            },
            {
                "title": "Site internet",
                "column_name": "website",
                "uidt": "URL",
                "rqd": False,
                "description": None,
                "meta": {
                    "help": "Votre site web"
                }
            }
        ]

        # Options pour les menus déroulants
        audience_options = [
            "Jeunes enfants",
            "Parents et enfants",
            "Parents",
            "Professeurs, parents et enfants",
            "Professeurs",
            "Professionnels"
        ]

        teaching_level_options = [
            "Maternelle",
            "Primaire",
            "Secondaire",
            "Maternelle et primaire",
            "Primaire et secondaire",
            "Maternelle-primaire et secondaire"
        ]

        teaching_type_options = [
            "Enseignement ordinaire",
            "Enseignement spécialisé",
            "Enseignement ordinaire et spécialisé"
        ]

        # Champs communs pour les sélections
        selection_fields = [
            {
                "title": f"À qui s'adresse {self.form_type[:-1] if self.form_type != 'stands' else 'le stand'} ?",
                "column_name": "audience_type",
                "uidt": "SingleSelect",
                "rqd": True,
                "description": None,
                "colOptions": {
                    "options": [{"title": opt} for opt in audience_options]
                }
            },
            {
                "title": "Niveau d'enseignement",
                "column_name": "teaching_level",
                "uidt": "SingleSelect",
                "rqd": True,
                "description": None,
                "colOptions": {
                    "options": [{"title": opt} for opt in teaching_level_options]
                }
            },
            {
                "title": "Type d'enseignement",
                "column_name": "teaching_type",
                "uidt": "SingleSelect",
                "rqd": True,
                "description": None,
                "colOptions": {
                    "options": [{"title": opt} for opt in teaching_type_options]
                }
            }
        ]

        # Champs spécifiques selon le type de formulaire
        if self.form_type == 'conferences':
            specific_fields = [
                {
                    "title": "Choisissez un titre pour la conférence",
                    "column_name": "title",
                    "uidt": "SingleLineText",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Titre de votre conférence"
                    }
                }
            ] + selection_fields + [
                {
                    "title": "Décrivez brièvement votre conférence pour les visiteurs",
                    "column_name": "description",
                    "uidt": "LongText",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Description (500 caractères max.)"
                    }
                },
                {
                    "title": "À propos de vous",
                    "column_name": "about_you",
                    "uidt": "LongText",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Description (500 caractères max.)"
                    }
                },
                {
                    "title": "Envoyez votre logo",
                    "column_name": "logo",
                    "uidt": "Attachment",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Fichier PNG ou JPG, taille minimum 600 pixels de large"
                    }
                },
                {
                    "title": "Envoyez une photo de vous",
                    "column_name": "photo",
                    "uidt": "Attachment",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Fichier PNG ou JPG, taille minimum 600 pixels de large"
                    }
                }
            ]
        elif self.form_type == 'stands':
            specific_fields = [
                {
                    "title": "Choisissez un titre court",
                    "column_name": "title",
                    "uidt": "SingleLineText",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Un titre court et accrocheur pour votre stand"
                    }
                }
            ] + selection_fields + [
                {
                    "title": "Décrivez brièvement votre stand pour les visiteurs",
                    "column_name": "description",
                    "uidt": "LongText",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Cette description apparaîtra dans le programme (500 caractères max.)"
                    }
                },
                {
                    "title": "Envoyez votre logo",
                    "column_name": "logo",
                    "uidt": "Attachment",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Fichier PNG ou JPG, taille minimum 600 pixels de large"
                    }
                }
            ]
        elif self.form_type == 'ateliers':
            specific_fields = [
                {
                    "title": "Choisissez un titre court",
                    "column_name": "title",
                    "uidt": "SingleLineText",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Titre de votre atelier"
                    }
                }
            ] + selection_fields + [
                {
                    "title": "Décrivez brièvement votre animation pour les visiteurs",
                    "column_name": "description",
                    "uidt": "LongText",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Description (500 caractères max.)"
                    }
                },
                {
                    "title": "À propos de vous",
                    "column_name": "about_you",
                    "uidt": "LongText",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Description (500 caractères max.)"
                    }
                },
                {
                    "title": "Envoyez votre logo",
                    "column_name": "logo",
                    "uidt": "Attachment",
                    "rqd": True,
                    "description": None,
                    "meta": {
                        "help": "Fichier PNG ou JPG, taille minimum 600 pixels de large"
                    }
                }
            ]

        return common_fields + specific_fields

    def create_table(self):
        """Crée la table selon le type de formulaire"""
        logger.info(f"Création de la table {self.form_config['table_name']}...")
        
        # Vérifier si la table existe déjà
        try:
            response = self._make_request('GET', f'/meta/bases/{self.base_id}/tables')
            # La réponse peut être soit une liste directement, soit dans une clé 'list'
            existing_tables = response.get('list', response) if isinstance(response, dict) else response
            
            if isinstance(existing_tables, list):
                for table in existing_tables:
                    if isinstance(table, dict) and table.get('table_name') == self.form_config['table_name']:
                        logger.info(f"La table {self.form_config['table_name']} existe déjà (ID: {table['id']})")
                        return table
        except Exception as e:
            logger.warning(f"Impossible de vérifier l'existence de la table: {str(e)}")
        
        # Si la table n'existe pas, la créer
        table_data = {
            "table_name": self.form_config['table_name'],
            "title": self.form_config['title'],
            "columns": self.get_columns()
        }

        try:
            response = self._make_request('POST', f'/meta/bases/{self.base_id}/tables', table_data)
            if isinstance(response, dict):
                return response
            logger.warning(f"Réponse inattendue lors de la création de la table: {response}")
            return {"id": response} if isinstance(response, str) else {"id": "unknown"}
        except NocoDBError as e:
            if "Table already exists" in str(e):
                logger.info(f"La table {self.form_config['table_name']} existe déjà")
                # Récupérer l'ID de la table existante
                try:
                    response = self._make_request('GET', f'/meta/bases/{self.base_id}/tables')
                    existing_tables = response.get('list', response) if isinstance(response, dict) else response
                    if isinstance(existing_tables, list):
                        for table in existing_tables:
                            if isinstance(table, dict) and table.get('table_name') == self.form_config['table_name']:
                                return table
                except Exception as inner_e:
                    logger.error(f"Erreur lors de la récupération de la table existante: {str(inner_e)}")
            raise e

    def create_form_view(self, table_id):
        """Crée la vue formulaire personnalisée"""
        logger.info(f"Vérification/Création du formulaire {self.form_config['form_title']}...")
        
        # Vérifier si une vue formulaire existe déjà
        try:
            existing_forms = self._make_request('GET', f'/meta/tables/{table_id}/views')
            forms_list = existing_forms.get('list', [])
            
            if isinstance(forms_list, list):
                for form in forms_list:
                    if isinstance(form, dict) and form.get('title') == self.form_config['form_title'] and form.get('type') == 1:
                        logger.info(f"Le formulaire existe déjà (ID: {form['id']})")
                        return form
        except Exception as e:
            logger.warning(f"Impossible de vérifier l'existence du formulaire: {str(e)}")

        # Si aucun formulaire n'existe, en créer un nouveau
        logger.info("Création d'une nouvelle vue formulaire...")
        
        # Configuration complète du formulaire
        form_data = {
            "title": self.form_config['form_title'],
            "type": 1,
            "show": True,
            "banner_image_url": self.form_config['banner_image'],
            "columns": [
                {
                    "fk_column_id": col['column_name'],
                    "description": col.get('meta', {}).get('help'),
                    "help": col.get('meta', {}).get('help'),
                    "label": col.get('title'),
                    "meta": None,
                    "order": 0,
                    "required": 1 if col.get('rqd') else 0,
                    "show": 1
                }
                for col in self.get_columns()
            ],
            "show_blank_form": True,
            "submit_another_form": False,
            "success_msg": "Merci ! Les organisateurs vous communiqueront les infos rapidement.",
            "heading": self.form_config['form_title'],
            "subheading": self.form_config['description'],
            "helpText": self.form_config['help_text'],
            "meta": {
                "sections": [
                    {
                        "title": self.form_config['sections']['about_you'],
                        "fields": ["firstname", "lastname", "email", "phone", "website"]
                    },
                    {
                        "title": self.form_config['sections'].get(f'about_{self.form_type[:-1]}'),
                        "fields": ["title", "target_audience", "teaching_type", "description", "about_you", "logo"]
                    }
                ]
            }
        }

        if self.form_type == 'conferences':
            form_data['meta']['sections'][1]['fields'].append('photo')

        try:
            # Créer le formulaire
            form_view = self._make_request(
                'POST', 
                f'/meta/tables/{table_id}/forms',
                form_data
            )

            return form_view

        except Exception as e:
            logger.error(f"Erreur lors de la création du formulaire: {str(e)}")
            raise

def create_all_forms():
    """Crée tous les formulaires du festival"""
    results = {}
    
    for form_type in FestivalFormCreator.FORM_TYPES.keys():
        logger.info(f"\nCréation du formulaire type: {form_type}")
        try:
            creator = FestivalFormCreator(form_type)
            result = create_festival_form(creator)
            if result:
                results[form_type] = result
                logger.info(f"Formulaire {form_type} créé avec succès!")
        except Exception as e:
            logger.error(f"Erreur lors de la création du formulaire {form_type}: {str(e)}")
    
    return results

def create_festival_form(creator=None):
    """Création d'un formulaire spécifique"""
    try:
        if creator is None:
            creator = FestivalFormCreator()

        table = creator.create_table()
        table_id = table.get('id')
        logger.info(f"Table créée avec succès (ID: {table_id})")

        try:
            form = creator.create_form_view(table_id)
            form_id = form.get('id') if isinstance(form, dict) else table_id
        except Exception as e:
            logger.warning(f"Erreur mineure lors de la création du formulaire: {str(e)}")
            form_id = table_id

        form_url = f"{creator.base_url}/dashboard/#/nc/form/{form_id}"
        
        result = {
            'table_id': table_id,
            'form_id': form_id,
            'form_url': form_url
        }
        
        logger.info(f"URL du formulaire: {form_url}")
        return result

    except Exception as e:
        logger.error(f"Erreur inattendue: {str(e)}")
        return None

if __name__ == "__main__":
    results = create_all_forms()