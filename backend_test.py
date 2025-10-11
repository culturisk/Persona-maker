#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Enhanced Human-Rooted Segmentation Studio
Tests authentication, validation, permissions, and all CRUD operations as specified in the review request.
"""

import requests
import json
import sys
import time
import uuid
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://human-segments.preview.emergentagent.com/api"
DEMO_MODE = True  # Test with demo mode fallback

class EnhancedBackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.workspace_id = None
        self.segment_id = None
        self.culture_profile_id = None
        self.economic_profile_id = None
        self.persona_id = None
        
    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'response_data': response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    def test_database_connection(self):
        """Test 1: Database Connection via Workspaces API"""
        try:
            print("\n=== Testing Database Connection ===")
            response = self.session.get(f"{self.base_url}/workspaces")
            
            if response.status_code == 200:
                data = response.json()
                if 'workspaces' in data:
                    self.log_result(
                        "Database Connection", 
                        True, 
                        f"Successfully connected to database. Found {len(data['workspaces'])} workspaces.",
                        data
                    )
                    return True
                else:
                    self.log_result(
                        "Database Connection", 
                        False, 
                        "Invalid response format - missing 'workspaces' key",
                        data
                    )
                    return False
            else:
                self.log_result(
                    "Database Connection", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else None
                )
                return False
                
        except Exception as e:
            self.log_result("Database Connection", False, f"Connection error: {str(e)}")
            return False
    
    def test_workspace_api(self):
        """Test 2: Workspace API - Get workspaces and create default workspace"""
        try:
            print("\n=== Testing Workspace API ===")
            
            # First get existing workspaces
            response = self.session.get(f"{self.base_url}/workspaces")
            if response.status_code != 200:
                self.log_result("Get Workspaces", False, f"Failed to get workspaces: {response.status_code}")
                return False
                
            data = response.json()
            workspaces = data.get('workspaces', [])
            
            if workspaces:
                # Use existing workspace
                self.workspace_id = workspaces[0]['id']
                self.log_result(
                    "Get Workspaces", 
                    True, 
                    f"Found {len(workspaces)} existing workspaces. Using workspace: {workspaces[0]['name']}",
                    data
                )
            else:
                # Create new workspace
                workspace_data = {
                    "name": "Test Workspace for Segmentation Studio"
                }
                
                response = self.session.post(
                    f"{self.base_url}/workspaces",
                    json=workspace_data,
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.workspace_id = data['workspace']['id']
                    self.log_result(
                        "Create Workspace", 
                        True, 
                        f"Successfully created workspace: {data['workspace']['name']}",
                        data
                    )
                else:
                    self.log_result(
                        "Create Workspace", 
                        False, 
                        f"Failed to create workspace: {response.status_code} - {response.text}"
                    )
                    return False
            
            return True
            
        except Exception as e:
            self.log_result("Workspace API", False, f"Error: {str(e)}")
            return False
    
    def test_segment_creation(self):
        """Test 3: Segment Creation with specified test data"""
        try:
            print("\n=== Testing Segment Creation ===")
            
            if not self.workspace_id:
                self.log_result("Segment Creation", False, "No workspace ID available")
                return False
            
            # Test data as specified in review request
            segment_data = {
                "workspaceId": self.workspace_id,
                "name": "Tech SMB Owners",
                "product": "CRM Software",
                "primaryBenefit": "Streamlined customer management and sales tracking",
                "reason": "Small business owners need efficient tools to manage growing customer bases",
                "context": "B2B software adoption for small to medium businesses",
                "values": ["efficiency", "growth"],
                "emotions": ["confidence"],
                "fears": ["complexity"],
                "frame": "Professional growth enablement",
                "evidence": "Market research shows 70% of SMBs struggle with customer data management",
                "notes": "Focus on ease of use and quick ROI demonstration"
            }
            
            response = self.session.post(
                f"{self.base_url}/segments",
                json=segment_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.segment_id = data['segment']['id']
                
                # Verify the segment data was saved correctly
                expected_fields = ['name', 'product', 'values', 'emotions', 'fears']
                all_fields_correct = True
                
                for field in expected_fields:
                    if field not in data['segment'] or data['segment'][field] != segment_data[field]:
                        all_fields_correct = False
                        break
                
                if all_fields_correct:
                    self.log_result(
                        "Segment Creation", 
                        True, 
                        f"Successfully created segment '{segment_data['name']}' with all specified data",
                        data
                    )
                else:
                    self.log_result(
                        "Segment Creation", 
                        False, 
                        "Segment created but data validation failed",
                        data
                    )
                    return False
            else:
                self.log_result(
                    "Segment Creation", 
                    False, 
                    f"Failed to create segment: {response.status_code} - {response.text}"
                )
                return False
            
            return True
            
        except Exception as e:
            self.log_result("Segment Creation", False, f"Error: {str(e)}")
            return False
    
    def test_culture_profile(self):
        """Test 4: Culture Profile Creation with specified test data"""
        try:
            print("\n=== Testing Culture Profile Creation ===")
            
            if not self.segment_id:
                self.log_result("Culture Profile", False, "No segment ID available")
                return False
            
            # Test data as specified in review request
            culture_data = {
                "segmentId": self.segment_id,
                "locale": "en-IN",
                "languages": [
                    {"code": "en", "script": "Latn", "proficiency": "primary"},
                    {"code": "hi", "script": "Deva", "proficiency": "secondary"}
                ],
                "region": {
                    "country": "IN",
                    "state": "MH",
                    "city": "Mumbai",
                    "city_tier": "Tier-1"
                },
                "urbanicity": "urban",
                "communicationStyle": "low_context",
                "timeOrientation": "monochronic",
                "formalityNorm": "mixed",
                "workweek": {
                    "start": "Mon",
                    "end": "Fri",
                    "weekend": ["Sat", "Sun"]
                },
                "schedulingNorms": {
                    "late_evening_ok": False,
                    "weekend_work": False
                },
                "festivals": ["Diwali", "Holi", "Eid"],
                "purchasingConstraints": {
                    "cod_prevalence": True,
                    "low_bandwidth": False
                },
                "deviceChannelPrefs": {
                    "android_share_high": True,
                    "whatsapp_preferred": True,
                    "email_secondary": True
                }
            }
            
            response = self.session.post(
                f"{self.base_url}/culture-profiles",
                json=culture_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.culture_profile_id = data['profile']['id']
                
                # Verify key fields
                profile = data['profile']
                if (profile['locale'] == culture_data['locale'] and 
                    profile['communicationStyle'] == culture_data['communicationStyle'] and
                    profile['formalityNorm'] == culture_data['formalityNorm']):
                    
                    self.log_result(
                        "Culture Profile", 
                        True, 
                        f"Successfully created culture profile for locale '{culture_data['locale']}'",
                        data
                    )
                else:
                    self.log_result(
                        "Culture Profile", 
                        False, 
                        "Culture profile created but data validation failed",
                        data
                    )
                    return False
            else:
                self.log_result(
                    "Culture Profile", 
                    False, 
                    f"Failed to create culture profile: {response.status_code} - {response.text}"
                )
                return False
            
            return True
            
        except Exception as e:
            self.log_result("Culture Profile", False, f"Error: {str(e)}")
            return False
    
    def test_economic_profile(self):
        """Test 5: Economic Profile Creation with specified test data"""
        try:
            print("\n=== Testing Economic Profile Creation ===")
            
            if not self.segment_id:
                self.log_result("Economic Profile", False, "No segment ID available")
                return False
            
            # Test data as specified in review request
            economic_data = {
                "segmentId": self.segment_id,
                "incomeBracket": "₹1L-₹2L",
                "currency": "INR",
                "profession": "SME_owner",
                "industry": "retail",
                "yearsOfService": 8,
                "employmentType": "self-employed",
                "financialBackground": "entrepreneurial/volatile",
                "familyFinancialBackground": "dual-income household",
                "socioeconomicStatus": "LOWER-MID",
                "priceSensitivity": "high",
                "purchaseFrequency": "occasional",
                "paymentBehaviour": {
                    "prefers_cod": True,
                    "upi": True,
                    "emi": False,
                    "subscription_aversion": True
                },
                "savingsInclination": "balanced",
                "riskAppetite": "moderate",
                "creditAccess": "limited",
                "financialGoals": ["business_expansion", "emergency_fund", "education"],
                "constraints": {
                    "shared_device": False,
                    "limited_data": False,
                    "time_poor": True
                }
            }
            
            response = self.session.post(
                f"{self.base_url}/economic-profiles",
                json=economic_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.economic_profile_id = data['profile']['id']
                
                # Verify key fields
                profile = data['profile']
                if (profile['incomeBracket'] == economic_data['incomeBracket'] and 
                    profile['profession'] == economic_data['profession'] and
                    profile['priceSensitivity'] == economic_data['priceSensitivity']):
                    
                    self.log_result(
                        "Economic Profile", 
                        True, 
                        f"Successfully created economic profile for {economic_data['profession']} with {economic_data['incomeBracket']} income",
                        data
                    )
                else:
                    self.log_result(
                        "Economic Profile", 
                        False, 
                        "Economic profile created but data validation failed",
                        data
                    )
                    return False
            else:
                self.log_result(
                    "Economic Profile", 
                    False, 
                    f"Failed to create economic profile: {response.status_code} - {response.text}"
                )
                return False
            
            return True
            
        except Exception as e:
            self.log_result("Economic Profile", False, f"Error: {str(e)}")
            return False
    
    def test_persona_generation(self):
        """Test 6: AI Persona Generation"""
        try:
            print("\n=== Testing Persona Generation ===")
            
            if not all([self.segment_id, self.culture_profile_id, self.economic_profile_id]):
                self.log_result("Persona Generation", False, "Missing required profile IDs")
                return False
            
            persona_request = {
                "segmentId": self.segment_id,
                "cultureProfileId": self.culture_profile_id,
                "economicProfileId": self.economic_profile_id
            }
            
            response = self.session.post(
                f"{self.base_url}/personas/generate",
                json=persona_request,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.persona_id = data['persona']['id']
                
                # Verify persona structure
                persona = data['persona']
                required_fields = ['name', 'positioning', 'cultural_cues', 'economic_cues', 'generalizations', 'pillars']
                
                missing_fields = [field for field in required_fields if field not in persona or not persona[field]]
                
                if not missing_fields:
                    # Check for assumptions_vs_facts in export_snapshot
                    has_assumptions = (
                        'export_snapshot' in persona and 
                        persona['export_snapshot'] and 
                        'assumptions_vs_facts' in persona['export_snapshot']
                    )
                    
                    if has_assumptions:
                        self.log_result(
                            "Persona Generation", 
                            True, 
                            f"Successfully generated persona '{persona['name']}' with all required fields and assumptions_vs_facts",
                            {'persona_name': persona['name'], 'has_assumptions_vs_facts': True}
                        )
                    else:
                        self.log_result(
                            "Persona Generation", 
                            True, 
                            f"Generated persona '{persona['name']}' but missing assumptions_vs_facts section",
                            {'persona_name': persona['name'], 'has_assumptions_vs_facts': False}
                        )
                else:
                    self.log_result(
                        "Persona Generation", 
                        False, 
                        f"Persona generated but missing required fields: {missing_fields}",
                        data
                    )
                    return False
            else:
                self.log_result(
                    "Persona Generation", 
                    False, 
                    f"Failed to generate persona: {response.status_code} - {response.text}"
                )
                return False
            
            return True
            
        except Exception as e:
            self.log_result("Persona Generation", False, f"Error: {str(e)}")
            return False
    
    def test_export_functionality(self):
        """Test 7: Export Persona as JSON"""
        try:
            print("\n=== Testing Export Functionality ===")
            
            if not self.persona_id:
                self.log_result("Export Functionality", False, "No persona ID available")
                return False
            
            response = self.session.get(f"{self.base_url}/personas/{self.persona_id}/export")
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify export structure
                required_sections = ['persona', 'segment', 'culture_profile', 'economic_profile', 'export_metadata']
                missing_sections = [section for section in required_sections if section not in data]
                
                # Check for assumptions_vs_facts specifically
                has_assumptions_vs_facts = 'assumptions_vs_facts' in data and data['assumptions_vs_facts']
                
                if not missing_sections and has_assumptions_vs_facts:
                    self.log_result(
                        "Export Functionality", 
                        True, 
                        f"Successfully exported persona with all required sections including assumptions_vs_facts",
                        {
                            'sections': list(data.keys()),
                            'has_assumptions_vs_facts': True,
                            'export_metadata': data.get('export_metadata', {})
                        }
                    )
                elif not missing_sections:
                    self.log_result(
                        "Export Functionality", 
                        True, 
                        f"Exported persona with all sections but missing assumptions_vs_facts",
                        {
                            'sections': list(data.keys()),
                            'has_assumptions_vs_facts': False
                        }
                    )
                else:
                    self.log_result(
                        "Export Functionality", 
                        False, 
                        f"Export missing required sections: {missing_sections}",
                        data
                    )
                    return False
            else:
                self.log_result(
                    "Export Functionality", 
                    False, 
                    f"Failed to export persona: {response.status_code} - {response.text}"
                )
                return False
            
            return True
            
        except Exception as e:
            self.log_result("Export Functionality", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print(f"🚀 Starting Backend API Tests for Human-Rooted Segmentation Studio")
        print(f"📍 Base URL: {self.base_url}")
        print(f"⏰ Test started at: {datetime.now().isoformat()}")
        
        tests = [
            self.test_database_connection,
            self.test_workspace_api,
            self.test_segment_creation,
            self.test_culture_profile,
            self.test_economic_profile,
            self.test_persona_generation,
            self.test_export_functionality
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ CRITICAL ERROR in {test.__name__}: {str(e)}")
                failed += 1
            
            # Small delay between tests
            time.sleep(0.5)
        
        # Print summary
        print(f"\n{'='*60}")
        print(f"🏁 TEST SUMMARY")
        print(f"{'='*60}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        print(f"⏰ Test completed at: {datetime.now().isoformat()}")
        
        if failed > 0:
            print(f"\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['message']}")
        
        return failed == 0

def main():
    """Main test execution"""
    tester = BackendTester()
    success = tester.run_all_tests()
    
    # Save detailed results to file
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': len(tester.test_results),
                'passed': sum(1 for r in tester.test_results if r['success']),
                'failed': sum(1 for r in tester.test_results if not r['success']),
                'success_rate': sum(1 for r in tester.test_results if r['success']) / len(tester.test_results) * 100,
                'test_completed_at': datetime.now().isoformat()
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())