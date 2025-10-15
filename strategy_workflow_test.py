#!/usr/bin/env python3
"""
Strategy Building Workflow Test - Phase 2 & 3 Testing
Tests the complete Human-Rooted Segmentation Studio strategy workflow as specified in the review request.
"""

import requests
import json
import sys
import time
from datetime import datetime

# Configuration
BASE_URL = "https://rooted-personas.preview.emergentagent.com/api"
DEMO_MODE = True

class StrategyWorkflowTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        
        # Test data storage
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

    def make_request(self, method, endpoint, data=None, params=None):
        """Make HTTP request with demo mode support"""
        url = f"{self.base_url}{endpoint}"
        
        if DEMO_MODE:
            if params is None:
                params = {}
            params['demo'] = 'true'
            
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params, headers=headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, params=params, headers=headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, params=params, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, params=params, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            return None

    def step_1_basic_infrastructure(self):
        """Step 1: Basic Infrastructure Testing"""
        print("\n🔧 STEP 1: Basic Infrastructure")
        
        # Test GET /api/workspaces (should return default workspace)
        response = self.make_request('GET', '/workspaces')
        if response and response.status_code == 200:
            data = response.json()
            if 'workspaces' in data and len(data['workspaces']) > 0:
                self.workspace_id = data['workspaces'][0]['id']
                self.log_result("GET /api/workspaces", True, 
                            f"Retrieved {len(data['workspaces'])} workspaces, using workspace: {self.workspace_id}")
                return True
            else:
                self.log_result("GET /api/workspaces", False, "No workspaces found")
                return False
        else:
            self.log_result("GET /api/workspaces", False, 
                        f"Failed with status: {response.status_code if response else 'No response'}")
            return False

    def step_2_segment_creation(self):
        """Step 2: Segment Creation Flow"""
        print("\n📊 STEP 2: Segment Creation Flow")
        
        if not self.workspace_id:
            self.log_result("Segment Creation Setup", False, "No workspace ID available")
            return False
            
        # Create segment with full data including "Any" cultural values
        segment_data = {
            "name": "Tech SMB Owners - High Price Sensitivity",
            "workspaceId": self.workspace_id,
            "frame": "Small business owners in technology sector",
            "product": "Business productivity software",
            "primaryBenefit": "Streamline operations and increase efficiency",
            "reason": "Need to compete with larger companies while managing costs",
            "context": "Growing tech SMB market in India with high price sensitivity",
            "values": ["efficiency", "growth", "frugality"],  # Including frugality for price sensitivity
            "emotions": ["confidence", "excitement"],
            "fears": ["complexity", "hidden_costs"],  # Key fear for high price sensitivity
            "evidence": "Market research shows 70% adoption rate among price-sensitive SMBs",
            "notes": "Focus on cost-effective solutions and transparent pricing"
        }
        
        response = self.make_request('POST', '/segments', segment_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'segment' in data:
                self.segment_id = data['segment']['id']
                self.log_result("POST /api/segments", True, 
                            f"Created segment: {data['segment']['name']}")
                
                # Test segment retrieval
                response = self.make_request('GET', f'/segments/{self.segment_id}')
                if response and response.status_code == 200:
                    self.log_result("GET /api/segments/{id}", True, "Successfully retrieved segment")
                    return True
                else:
                    self.log_result("GET /api/segments/{id}", False, "Failed to retrieve segment")
                    return False
            else:
                self.log_result("POST /api/segments", False, "Invalid response structure")
                return False
        else:
            self.log_result("POST /api/segments", False, 
                        f"Failed with status: {response.status_code if response else 'No response'}")
            return False

    def step_3_culture_profile(self):
        """Step 3: Culture Profile Flow with 'Any' options"""
        print("\n🌍 STEP 3: Culture Profile Flow")
        
        if not self.segment_id:
            self.log_result("Culture Profile Setup", False, "No segment ID available")
            return False
            
        # Create culture profile with "Any" options and specific preferences
        culture_data = {
            "segmentId": self.segment_id,
            "locale": "en-IN",  # Specific locale
            "communicationStyle": "low_context",  # Direct communication for efficiency
            "formalityNorm": "mixed",  # Flexible formality
            "languages": ["English", "Hindi"],
            "region": {"country": "IN", "state": "MH", "city": "Mumbai", "cityTier": "Tier-1"},
            "urbanicity": "urban",
            "deviceChannelPrefs": {
                "whatsapp_preferred": True,
                "android_share_high": True,
                "email_preferred": True
            },
            "purchasingConstraints": {
                "cod_prevalence": True,
                "low_bandwidth": False
            }
        }
        
        response = self.make_request('POST', '/culture-profiles', culture_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'profile' in data:
                self.culture_profile_id = data['profile']['id']
                self.log_result("POST /api/culture-profiles", True, 
                            f"Created culture profile with locale: {data['profile']['locale']}")
                return True
            else:
                self.log_result("POST /api/culture-profiles", False, "Invalid response structure")
                return False
        else:
            self.log_result("POST /api/culture-profiles", False, 
                        f"Failed with status: {response.status_code if response else 'No response'}")
            return False

    def step_4_economic_profile(self):
        """Step 4: Economic Profile Flow with 'Any' economic values"""
        print("\n💰 STEP 4: Economic Profile Flow")
        
        if not self.segment_id:
            self.log_result("Economic Profile Setup", False, "No segment ID available")
            return False
            
        # Create economic profile with high price sensitivity and UPI preference
        economic_data = {
            "segmentId": self.segment_id,
            "incomeBracket": "₹1L-₹2L",  # Mid-range income
            "profession": "SME_owner",  # Small business owner
            "priceSensitivity": "high",  # High price sensitivity for testing
            "industry": "technology",
            "employmentType": "self_employed",
            "financialBackground": "first_gen_earner",
            "socioeconomicStatus": "MID",
            "paymentBehaviour": {
                "upi_preferred": True,  # UPI preference for testing
                "credit_card": False,
                "emi_friendly": True,
                "subscription_aversion": False,
                "prefers_cod": False
            },
            "financialGoals": ["business_growth", "cost_optimization"],
            "constraints": ["limited_budget", "cash_flow_management"],
            "savingsInclination": "saver",
            "riskAppetite": "low"
        }
        
        response = self.make_request('POST', '/economic-profiles', economic_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'profile' in data:
                self.economic_profile_id = data['profile']['id']
                self.log_result("POST /api/economic-profiles", True, 
                            f"Created economic profile with income: {data['profile']['incomeBracket']}, price sensitivity: {data['profile']['priceSensitivity']}")
                return True
            else:
                self.log_result("POST /api/economic-profiles", False, "Invalid response structure")
                return False
        else:
            self.log_result("POST /api/economic-profiles", False, 
                        f"Failed with status: {response.status_code if response else 'No response'}")
            return False

    def step_5_persona_generation(self):
        """Step 5: Persona Generation"""
        print("\n👤 STEP 5: Persona Generation")
        
        if not all([self.segment_id, self.culture_profile_id, self.economic_profile_id]):
            self.log_result("Persona Generation Setup", False, "Missing required profile IDs")
            return False
            
        # Generate persona with complete segment+culture+economic data
        persona_data = {
            "segmentId": self.segment_id,
            "cultureProfileId": self.culture_profile_id,
            "economicProfileId": self.economic_profile_id
        }
        
        response = self.make_request('POST', '/personas/generate', persona_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'persona' in data and 'name' in data['persona']:
                self.persona_id = data['persona']['id']
                self.log_result("POST /api/personas/generate", True, 
                            f"Generated persona: {data['persona']['name']}")
                return True
            else:
                self.log_result("POST /api/personas/generate", False, "Invalid response structure")
                return False
        else:
            self.log_result("POST /api/personas/generate", False, 
                        f"Failed with status: {response.status_code if response else 'No response'}")
            return False

    def step_6_strategy_generation(self):
        """Step 6: Strategy Generation (NEW)"""
        print("\n🎯 STEP 6: Strategy Generation")
        
        if not self.persona_id:
            self.log_result("Strategy Generation Setup", False, "No persona ID available")
            return False
            
        strategy_types = ['positioning', 'messaging', 'pricing']
        success_count = 0
        
        for strategy_type in strategy_types:
            response = self.make_request('POST', f'/personas/{self.persona_id}/strategies/{strategy_type}/generate')
            if response and response.status_code == 200:
                data = response.json()
                if 'strategy' in data:
                    strategy = data['strategy']
                    
                    # Validate strategy content based on type and persona characteristics
                    if strategy_type == 'positioning':
                        # Check for positioning elements
                        required_fields = ['positioning_statement', 'competitive_frame', 'elevator_pitch_1s']
                        if all(field in strategy for field in required_fields):
                            self.log_result(f"Strategy Generation - {strategy_type}", True, 
                                        f"Generated positioning strategy with competitive frame and elevator pitches")
                            success_count += 1
                        else:
                            self.log_result(f"Strategy Generation - {strategy_type}", False, 
                                        f"Missing required positioning fields")
                    
                    elif strategy_type == 'messaging':
                        # Check for messaging elements and low-context adaptation
                        required_fields = ['messaging_pillars', 'tone_of_voice']
                        if all(field in strategy for field in required_fields):
                            tone = strategy.get('tone_of_voice', {})
                            # Check if tone reflects low-context communication (direct)
                            if 'direct' in str(tone).lower():
                                self.log_result(f"Strategy Generation - {strategy_type}", True, 
                                            f"Generated direct messaging strategy (low-context adaptation)")
                            else:
                                self.log_result(f"Strategy Generation - {strategy_type}", True, 
                                            f"Generated messaging strategy with pillars and tone")
                            success_count += 1
                        else:
                            self.log_result(f"Strategy Generation - {strategy_type}", False, 
                                        f"Missing required messaging fields")
                    
                    elif strategy_type == 'pricing':
                        # Check for pricing elements and high price sensitivity adaptation
                        required_fields = ['pricing_tiers', 'payment_options']
                        if all(field in strategy for field in required_fields):
                            payment_options = strategy.get('payment_options', [])
                            pricing_tiers = strategy.get('pricing_tiers', [])
                            
                            # Check for UPI payment option
                            has_upi = any('UPI' in str(option) for option in payment_options)
                            # Check for cost-focused pricing (Starter tier or similar)
                            has_cost_focus = any('Starter' in str(tier) or 'cost' in str(tier).lower() 
                                               for tier in pricing_tiers)
                            
                            if has_upi and has_cost_focus:
                                self.log_result(f"Strategy Generation - {strategy_type}", True, 
                                            f"Generated cost-focused pricing with UPI options (high price sensitivity + UPI preference)")
                            elif has_upi:
                                self.log_result(f"Strategy Generation - {strategy_type}", True, 
                                            f"Generated pricing strategy with UPI payment options")
                            else:
                                self.log_result(f"Strategy Generation - {strategy_type}", True, 
                                            f"Generated pricing strategy with tiers and payment options")
                            success_count += 1
                        else:
                            self.log_result(f"Strategy Generation - {strategy_type}", False, 
                                        f"Missing required pricing fields")
                else:
                    self.log_result(f"Strategy Generation - {strategy_type}", False, 
                                f"Invalid response structure")
            else:
                self.log_result(f"Strategy Generation - {strategy_type}", False, 
                            f"Failed with status: {response.status_code if response else 'No response'}")
        
        return success_count == len(strategy_types)

    def step_7_export_system(self):
        """Step 7: Export System"""
        print("\n📤 STEP 7: Export System")
        
        if not self.persona_id:
            self.log_result("Export System Setup", False, "No persona ID available")
            return False
            
        success_count = 0
        
        # Test original persona export
        response = self.make_request('GET', f'/personas/{self.persona_id}/export')
        if response and response.status_code == 200:
            data = response.json()
            required_sections = ['persona', 'segment', 'culture_profile', 'economic_profile', 'export_metadata']
            if all(section in data for section in required_sections):
                # Check for assumptions_vs_facts
                if 'assumptions_vs_facts' in data:
                    self.log_result("Persona Export", True, 
                                "Successfully exported persona with assumptions_vs_facts")
                else:
                    self.log_result("Persona Export", True, 
                                "Successfully exported persona (assumptions_vs_facts missing)")
                success_count += 1
            else:
                self.log_result("Persona Export", False, "Missing required export sections")
        else:
            self.log_result("Persona Export", False, 
                        f"Failed with status: {response.status_code if response else 'No response'}")
        
        # Test new strategy export (export-all)
        response = self.make_request('GET', f'/personas/{self.persona_id}/strategies/export-all')
        if response and response.status_code == 200:
            data = response.json()
            if 'persona' in data and 'strategies' in data and 'exported_at' in data:
                self.log_result("Strategy Export All", True, 
                            "Successfully exported all strategies with complete data")
                success_count += 1
            else:
                self.log_result("Strategy Export All", False, "Invalid export-all structure")
        else:
            self.log_result("Strategy Export All", False, 
                        f"Failed with status: {response.status_code if response else 'No response'}")
        
        return success_count >= 1

    def run_complete_workflow(self):
        """Run the complete strategy building workflow"""
        print(f"🚀 Starting Strategy Building Workflow Test")
        print(f"📍 Base URL: {self.base_url}")
        print(f"⏰ Test started at: {datetime.now().isoformat()}")
        
        steps = [
            ("Basic Infrastructure", self.step_1_basic_infrastructure),
            ("Segment Creation Flow", self.step_2_segment_creation),
            ("Culture Profile Flow", self.step_3_culture_profile),
            ("Economic Profile Flow", self.step_4_economic_profile),
            ("Persona Generation", self.step_5_persona_generation),
            ("Strategy Generation", self.step_6_strategy_generation),
            ("Export System", self.step_7_export_system)
        ]
        
        passed_steps = 0
        failed_steps = 0
        
        for step_name, step_func in steps:
            try:
                if step_func():
                    passed_steps += 1
                    print(f"✅ {step_name} - COMPLETED")
                else:
                    failed_steps += 1
                    print(f"❌ {step_name} - FAILED")
                    # Continue with next step even if current fails
            except Exception as e:
                print(f"❌ CRITICAL ERROR in {step_name}: {str(e)}")
                failed_steps += 1
            
            time.sleep(0.5)  # Small delay between steps
        
        # Print summary
        print(f"\n{'='*80}")
        print(f"🏁 STRATEGY WORKFLOW TEST SUMMARY")
        print(f"{'='*80}")
        print(f"✅ Passed Steps: {passed_steps}")
        print(f"❌ Failed Steps: {failed_steps}")
        print(f"📊 Success Rate: {(passed_steps/(passed_steps+failed_steps)*100):.1f}%")
        print(f"⏰ Test completed at: {datetime.now().isoformat()}")
        
        # Print detailed results
        if failed_steps > 0:
            print(f"\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result['success']:
                print(f"   • {result['test']}")
        
        return failed_steps == 0

def main():
    """Main test execution"""
    tester = StrategyWorkflowTester()
    success = tester.run_complete_workflow()
    
    # Save detailed results
    with open('/app/strategy_workflow_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': len(tester.test_results),
                'passed': sum(1 for r in tester.test_results if r['success']),
                'failed': sum(1 for r in tester.test_results if not r['success']),
                'success_rate': sum(1 for r in tester.test_results if r['success']) / len(tester.test_results) * 100 if tester.test_results else 0,
                'test_completed_at': datetime.now().isoformat()
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())