#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
  local status=$1
  local message=$2
  if [ $status -eq 0 ]; then
    echo -e "${GREEN}✅ SUCCÈS${NC}: $message"
  else
    echo -e "${RED}❌ ÉCHEC${NC}: $message"
  fi
}

# Fonction pour exécuter un test
run_test() {
  local name=$1
  local command=$2
  local expected_status=$3
  local expected_location=$4
  
  echo -e "\n${BLUE}=== TEST: $name ===${NC}"
  echo -e "${YELLOW}Commande:${NC} $command"
  
  # Exécuter la commande et capturer la sortie
  output=$(eval $command 2>&1)
  status_line=$(echo "$output" | grep -i "HTTP/")
  status_code=$(echo "$status_line" | awk '{print $2}')
  location=$(echo "$output" | grep -i "location:" | awk '{print $2}')
  
  echo -e "${YELLOW}Réponse:${NC} $status_line"
  
  # Vérifier le code de statut
  if [ "$status_code" = "$expected_status" ]; then
    status_check=0
  else
    status_check=1
  fi
  
  # Vérifier la redirection si nécessaire
  if [ -n "$expected_location" ]; then
    echo -e "${YELLOW}Location attendue:${NC} $expected_location"
    echo -e "${YELLOW}Location reçue:${NC} $location"
    
    if [[ "$location" == *"$expected_location"* ]]; then
      location_check=0
    else
      location_check=1
    fi
    
    # Combiner les résultats
    if [ $status_check -eq 0 ] && [ $location_check -eq 0 ]; then
      print_result 0 "Code $status_code et redirection vers $location"
    else
      print_result 1 "Attendu: code $expected_status et redirection vers $expected_location"
    fi
  else
    # Pas de vérification de redirection
    print_result $status_check "Code $status_code"
  fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TESTS DU SYSTÈME D'AUTHENTIFICATION  ${NC}"
echo -e "${BLUE}========================================${NC}"

# Test 1: Accès à /dashboard sans authentification
run_test "Accès à /dashboard sans authentification" \
  "curl -s -I http://localhost:3001/dashboard" \
  "302" \
  "/login?error=auth_required"

# Test 2: Accès à /dashboard/ avec slash final
run_test "Accès à /dashboard/ avec slash final" \
  "curl -s -I http://localhost:3001/dashboard/" \
  "302" \
  "/login?error=auth_required"

# Test 3: Accès à /dashboard/index.html
run_test "Accès à /dashboard/index.html" \
  "curl -s -I http://localhost:3001/dashboard/index.html" \
  "200" \
  ""

# Test 4: Accès à /dashboard avec header X-Bypass-Auth
run_test "Accès à /dashboard avec header X-Bypass-Auth" \
  "curl -s -I -H \"X-Bypass-Auth: true\" http://localhost:3001/dashboard" \
  "200" \
  ""

# Test 5: Simulation d'une redirection après login
run_test "Simulation d'une redirection après login" \
  "curl -s -I -H \"X-Bypass-Auth: true\" http://localhost:3001/dashboard/" \
  "200" \
  ""

# Test 6: Vérification de la page de login
run_test "Vérification de la page de login" \
  "curl -s -I http://localhost:3001/login" \
  "200" \
  ""

# Test 7: Simulation avec des tokens invalides
run_test "Simulation avec des tokens invalides" \
  "curl -s -I -H \"Cookie: sb-access-token=fake-token; sb-refresh-token=fake-token\" http://localhost:3001/dashboard/" \
  "302" \
  "/login?error=auth_error"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}            TESTS TERMINÉS              ${NC}"
echo -e "${BLUE}========================================${NC}" 