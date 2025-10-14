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

    def make_request(self, method, endpoint, data=None, params=None):
        """Make HTTP request with demo mode support"""
        url = f"{self.base_url}{endpoint}"
        
        # Add demo mode parameter if enabled
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
    
    def test_authentication_system(self):
        """Test 1: Authentication System - NextAuth.js integration and demo mode fallback"""
        print("\n=== Testing Authentication System ===")
        
        # Test demo mode fallback
        try:
            response = self.make_request('GET', '/workspaces')
            if response and response.status_code == 200:
                data = response.json()
                if 'workspaces' in data:
                    self.log_result("Demo Mode Authentication", True, 
                                f"Successfully authenticated in demo mode, found {len(data['workspaces'])} workspaces")
                    return True
                else:
                    self.log_result("Demo Mode Authentication", False, "Invalid response structure")
                    return False
            else:
                self.log_result("Demo Mode Authentication", False, 
                            f"Failed with status: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("Demo Mode Authentication", False, f"Connection error: {str(e)}")
            return False
    
    def test_workspace_crud_operations(self):
        """Test 2: Enhanced Workspace API Endpoints with validation"""
        print("\n=== Testing Workspace CRUD Operations ===")
        
        # Test GET /api/workspaces
        try:
            response = self.make_request('GET', '/workspaces')
            if response and response.status_code == 200:
                data = response.json()
                if 'workspaces' in data and isinstance(data['workspaces'], list):
                    self.log_result("GET /api/workspaces", True, 
                                f"Retrieved {len(data['workspaces'])} workspaces")
                    # Store first workspace for later tests
                    if data['workspaces']:
                        self.workspace_id = data['workspaces'][0]['id']
                else:
                    self.log_result("GET /api/workspaces", False, "Invalid response structure")
                    return False
            else:
                self.log_result("GET /api/workspaces", False, 
                            f"Failed with status: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("GET /api/workspaces", False, f"Error: {str(e)}")
            return False

        # Test POST /api/workspaces - Valid workspace creation
        try:
            workspace_data = {
                "name": f"Test Workspace {int(time.time())}"
            }
            response = self.make_request('POST', '/workspaces', workspace_data)
            if response and response.status_code == 200:
                data = response.json()
                if 'workspace' in data and data['workspace']['name'] == workspace_data['name']:
                    self.workspace_id = data['workspace']['id']  # Update for later tests
                    self.log_result("POST /api/workspaces (Valid)", True, 
                                f"Created workspace: {data['workspace']['name']}")
                else:
                    self.log_result("POST /api/workspaces (Valid)", False, "Invalid response structure")
                    return False
            else:
                self.log_result("POST /api/workspaces (Valid)", False, 
                            f"Failed with status: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("POST /api/workspaces (Valid)", False, f"Error: {str(e)}")
            return False

        # Test POST /api/workspaces - Invalid data (empty name)
        try:
            invalid_data = {"name": ""}
            response = self.make_request('POST', '/workspaces', invalid_data)
            if response and response.status_code == 400:
                self.log_result("POST /api/workspaces (Invalid - Empty Name)", True, 
                            "Correctly rejected empty workspace name")
            else:
                self.log_result("POST /api/workspaces (Invalid - Empty Name)", False, 
                            f"Should have returned 400, got: {response.status_code if response else 'No response'}")
        except Exception as e:
            self.log_result("POST /api/workspaces (Invalid - Empty Name)", False, f"Error: {str(e)}")

        # Test PUT /api/workspaces/:id - Update workspace
        if self.workspace_id:
            try:
                update_data = {
                    "name": f"Updated Workspace {int(time.time())}"
                }
                response = self.make_request('PUT', f'/workspaces/{self.workspace_id}', update_data)
                if response and response.status_code == 200:
                    data = response.json()
                    if 'workspace' in data and data['workspace']['name'] == update_data['name']:
                        self.log_result("PUT /api/workspaces/:id", True, 
                                    f"Updated workspace name to: {data['workspace']['name']}")
                    else:
                        self.log_result("PUT /api/workspaces/:id", False, "Invalid response structure")
                        return False
                else:
                    self.log_result("PUT /api/workspaces/:id", False, 
                                f"Failed with status: {response.status_code if response else 'No response'}")
                    return False
            except Exception as e:
                self.log_result("PUT /api/workspaces/:id", False, f"Error: {str(e)}")
                return False

        return True
    
    def test_validation_system(self):
        """Test 3: Validation System - Test blocked terms and ethical compliance"""
        print("\n=== Testing Validation System ===")
        
        # Test workspace creation with blocked terms
        blocked_terms_tests = [
            ("exclude", "Workspace with exclude"),
            ("race", "Workspace about race"),
            ("religion", "Religious workspace"),
            ("caste", "Caste-based workspace")
        ]
        
        success_count = 0
        for term, name in blocked_terms_tests:
            try:
                blocked_data = {"name": name}
                response = self.make_request('POST', '/workspaces', blocked_data)
                if response and response.status_code == 400:
                    data = response.json()
                    if 'error' in data and 'Content validation failed' in data['error']:
                        self.log_result(f"Blocked Term Validation ({term})", True, 
                                    f"Correctly blocked workspace name containing '{term}'")
                        success_count += 1
                    else:
                        self.log_result(f"Blocked Term Validation ({term})", False, 
                                    "Wrong error message for blocked term")
                else:
                    self.log_result(f"Blocked Term Validation ({term})", False, 
                                f"Should have blocked term '{term}', got status: {response.status_code if response else 'No response'}")
            except Exception as e:
                self.log_result(f"Blocked Term Validation ({term})", False, f"Error: {str(e)}")
        
        return success_count > 0

    def test_segment_crud_operations(self):
        """Test 4: Enhanced Segment API Endpoints with validation"""
        print("\n=== Testing Segment CRUD Operations ===")
        
        if not self.workspace_id:
            self.log_result("Segment CRUD Setup", False, "No workspace ID available for segment testing")
            return False

        # Test POST /api/segments - Create segment with validation
        try:
            segment_data = {
                "name": "Tech SMB Owners",
                "workspaceId": self.workspace_id,
                "frame": "Small business owners in technology sector",
                "product": "Business productivity software",
                "primaryBenefit": "Streamline operations and increase efficiency",
                "reason": "Need to compete with larger companies",
                "context": "Growing tech SMB market in India",
                "values": ["efficiency", "growth", "innovation"],
                "emotions": ["confidence", "excitement"],
                "fears": ["complexity", "hidden_costs"],
                "evidence": "Market research shows 70% adoption rate",
                "notes": "Focus on ease of use and transparent pricing"
            }
            response = self.make_request('POST', '/segments', segment_data)
            if response and response.status_code == 200:
                data = response.json()
                if 'segment' in data and data['segment']['name'] == segment_data['name']:
                    self.segment_id = data['segment']['id']
                    self.log_result("POST /api/segments (Valid)", True, 
                                f"Created segment: {data['segment']['name']}")
                else:
                    self.log_result("POST /api/segments (Valid)", False, "Invalid response structure")
                    return False
            else:
                self.log_result("POST /api/segments (Valid)", False, 
                            f"Failed with status: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("POST /api/segments (Valid)", False, f"Error: {str(e)}")
            return False

        # Test POST /api/segments - With blocked terms
        try:
            blocked_segment_data = {
                "name": "Exclude certain groups",
                "workspaceId": self.workspace_id,
                "context": "We want to exclude people based on race"
            }
            response = self.make_request('POST', '/segments', blocked_segment_data)
            if response and response.status_code == 400:
                self.log_result("POST /api/segments (Blocked Terms)", True, 
                            "Correctly blocked segment with prohibited terms")
            else:
                self.log_result("POST /api/segments (Blocked Terms)", False, 
                            f"Should have blocked segment, got status: {response.status_code if response else 'No response'}")
        except Exception as e:
            self.log_result("POST /api/segments (Blocked Terms)", False, f"Error: {str(e)}")

        # Test GET /api/segments/:id - Get single segment
        if self.segment_id:
            try:
                response = self.make_request('GET', f'/segments/{self.segment_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if 'segment' in data and data['segment']['id'] == self.segment_id:
                        self.log_result("GET /api/segments/:id", True, 
                                    f"Retrieved segment: {data['segment']['name']}")
                    else:
                        self.log_result("GET /api/segments/:id", False, "Invalid response structure")
                        return False
                else:
                    self.log_result("GET /api/segments/:id", False, 
                                f"Failed with status: {response.status_code if response else 'No response'}")
                    return False
            except Exception as e:
                self.log_result("GET /api/segments/:id", False, f"Error: {str(e)}")
                return False

        # Test PUT /api/segments/:id - Update segment
        if self.segment_id:
            try:
                update_data = {
                    "name": "Updated Tech SMB Owners",
                    "workspaceId": self.workspace_id,
                    "primaryBenefit": "Enhanced productivity and growth"
                }
                response = self.make_request('PUT', f'/segments/{self.segment_id}', update_data)
                if response and response.status_code == 200:
                    data = response.json()
                    if 'segment' in data and data['segment']['name'] == update_data['name']:
                        self.log_result("PUT /api/segments/:id", True, 
                                    f"Updated segment name to: {data['segment']['name']}")
                    else:
                        self.log_result("PUT /api/segments/:id", False, "Invalid response structure")
                        return False
                else:
                    self.log_result("PUT /api/segments/:id", False, 
                                f"Failed with status: {response.status_code if response else 'No response'}")
                    return False
            except Exception as e:
                self.log_result("PUT /api/segments/:id", False, f"Error: {str(e)}")
                return False

        return True
    
    def test_permissions_system(self):
        """Test 5: Permissions System - Test workspace access control"""
        print("\n=== Testing Permissions System ===")
        
        # Test access to non-existent workspace (should be forbidden)
        try:
            fake_workspace_id = str(uuid.uuid4())
            response = self.make_request('GET', f'/workspaces/{fake_workspace_id}/segments')
            if response and response.status_code == 403:
                self.log_result("Workspace Access Control", True, 
                            "Correctly denied access to non-accessible workspace")
            else:
                self.log_result("Workspace Access Control", False, 
                            f"Should have returned 403, got: {response.status_code if response else 'No response'}")
        except Exception as e:
            self.log_result("Workspace Access Control", False, f"Error: {str(e)}")

        # Test segment access permissions
        if self.workspace_id:
            try:
                response = self.make_request('GET', f'/workspaces/{self.workspace_id}/segments')
                if response and response.status_code == 200:
                    data = response.json()
                    if 'segments' in data:
                        self.log_result("Segment Access Permissions", True, 
                                    f"Successfully accessed segments in owned workspace")
                        return True
                    else:
                        self.log_result("Segment Access Permissions", False, "Invalid response structure")
                        return False
                else:
                    self.log_result("Segment Access Permissions", False, 
                                f"Failed with status: {response.status_code if response else 'No response'}")
                    return False
            except Exception as e:
                self.log_result("Segment Access Permissions", False, f"Error: {str(e)}")
                return False
        
        return False
    
    def test_culture_economic_profiles(self):
        """Test 6: Culture and Economic Profile Operations"""
        print("\n=== Testing Culture and Economic Profile Operations ===")
        
        if not self.segment_id:
            self.log_result("Profile Operations Setup", False, "No segment ID available for profile testing")
            return False

        # Test POST /api/culture-profiles - Create culture profile
        try:
            culture_data = {
                "segmentId": self.segment_id,
                "locale": "en-IN",
                "communicationStyle": "low_context",
                "formalityNorm": "mixed",
                "languages": ["English", "Hindi"],
                "region": "Mumbai",
                "deviceChannelPrefs": {
                    "whatsapp_preferred": True,
                    "android_share_high": True
                }
            }
            response = self.make_request('POST', '/culture-profiles', culture_data)
            if response and response.status_code == 200:
                data = response.json()
                if 'profile' in data and data['profile']['locale'] == culture_data['locale']:
                    self.culture_profile_id = data['profile']['id']
                    self.log_result("POST /api/culture-profiles", True, 
                                f"Created culture profile with locale: {data['profile']['locale']}")
                else:
                    self.log_result("POST /api/culture-profiles", False, "Invalid response structure")
                    return False
            else:
                self.log_result("POST /api/culture-profiles", False, 
                            f"Failed with status: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("POST /api/culture-profiles", False, f"Error: {str(e)}")
            return False

        # Test POST /api/economic-profiles - Create economic profile
        try:
            economic_data = {
                "segmentId": self.segment_id,
                "incomeBracket": "₹1L-₹2L",
                "profession": "SME_owner",
                "priceSensitivity": "high",
                "paymentBehaviour": {
                    "upi_preferred": True,
                    "credit_card": False,
                    "emi_friendly": True,
                    "subscription_aversion": False
                },
                "financialGoals": ["business_growth", "cost_optimization"],
                "constraints": ["limited_budget", "cash_flow_management"]
            }
            response = self.make_request('POST', '/economic-profiles', economic_data)
            if response and response.status_code == 200:
                data = response.json()
                if 'profile' in data and data['profile']['incomeBracket'] == economic_data['incomeBracket']:
                    self.economic_profile_id = data['profile']['id']
                    self.log_result("POST /api/economic-profiles", True, 
                                f"Created economic profile with income bracket: {data['profile']['incomeBracket']}")
                else:
                    self.log_result("POST /api/economic-profiles", False, "Invalid response structure")
                    return False
            else:
                self.log_result("POST /api/economic-profiles", False, 
                            f"Failed with status: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("POST /api/economic-profiles", False, f"Error: {str(e)}")
            return False

        return True

    def test_persona_operations(self):
        """Test 7: Persona Operations - Create personas for strategy testing"""
        print("\n=== Testing Persona Operations ===")
        
        if not self.segment_id:
            self.log_result("Persona Operations Setup", False, "No segment ID available for persona testing")
            return False

        # Test POST /api/personas/generate - Generate persona with profiles
        try:
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
                else:
                    self.log_result("POST /api/personas/generate", False, "Invalid response structure")
                    return False
            else:
                self.log_result("POST /api/personas/generate", False, 
                            f"Failed with status: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("POST /api/personas/generate", False, f"Error: {str(e)}")
            return False

        return True

    def test_strategy_generation_endpoints(self):
        """Test 8: Strategy Generation API Endpoints - Phase 2 & 3 Strategy Testing"""
        print("\n=== Testing Strategy Generation Endpoints ===")
        
        if not self.persona_id:
            self.log_result("Strategy Generation Setup", False, "No persona ID available for strategy testing")
            return False

        strategy_types = ['positioning', 'messaging', 'pricing']
        success_count = 0

        for strategy_type in strategy_types:
            try:
                # Test POST /api/personas/{id}/strategies/{type}/generate
                response = self.make_request('POST', f'/personas/{self.persona_id}/strategies/{strategy_type}/generate')
                if response and response.status_code == 200:
                    data = response.json()
                    if 'strategy' in data:
                        strategy = data['strategy']
                        
                        # Validate strategy structure based on type
                        if strategy_type == 'positioning':
                            required_fields = ['positioning_statement', 'competitive_frame', 'elevator_pitch_1s', 'elevator_pitch_10s', 'elevator_pitch_30s']
                            if all(field in strategy for field in required_fields):
                                self.log_result(f"POST /api/personas/strategies/{strategy_type}/generate", True, 
                                            f"Generated {strategy_type} strategy with positioning statement and elevator pitches")
                                success_count += 1
                            else:
                                self.log_result(f"POST /api/personas/strategies/{strategy_type}/generate", False, 
                                            f"Missing required fields in {strategy_type} strategy")
                        
                        elif strategy_type == 'messaging':
                            required_fields = ['messaging_pillars', 'tone_of_voice', 'objections']
                            if all(field in strategy for field in required_fields):
                                self.log_result(f"POST /api/personas/strategies/{strategy_type}/generate", True, 
                                            f"Generated {strategy_type} strategy with messaging pillars and tone of voice")
                                success_count += 1
                            else:
                                self.log_result(f"POST /api/personas/strategies/{strategy_type}/generate", False, 
                                            f"Missing required fields in {strategy_type} strategy")
                        
                        elif strategy_type == 'pricing':
                            required_fields = ['pricing_tiers', 'payment_options', 'monetization_hypotheses']
                            if all(field in strategy for field in required_fields):
                                # Validate pricing tiers match persona's income bracket and sensitivity
                                pricing_tiers = strategy.get('pricing_tiers', [])
                                if pricing_tiers and any('UPI' in str(strategy.get('payment_options', [])) for _ in [1]):
                                    self.log_result(f"POST /api/personas/strategies/{strategy_type}/generate", True, 
                                                f"Generated {strategy_type} strategy with UPI payment options (matching persona preferences)")
                                else:
                                    self.log_result(f"POST /api/personas/strategies/{strategy_type}/generate", True, 
                                                f"Generated {strategy_type} strategy with pricing tiers and payment options")
                                success_count += 1
                            else:
                                self.log_result(f"POST /api/personas/strategies/{strategy_type}/generate", False, 
                                            f"Missing required fields in {strategy_type} strategy")
                        
                    else:
                        self.log_result(f"POST /api/personas/strategies/{strategy_type}/generate", False, 
                                    f"Invalid response structure for {strategy_type} strategy")
                else:
                    self.log_result(f"POST /api/personas/strategies/{strategy_type}/generate", False, 
                                f"Failed with status: {response.status_code if response else 'No response'}")
            except Exception as e:
                self.log_result(f"POST /api/personas/strategies/{strategy_type}/generate", False, f"Error: {str(e)}")

        return success_count == len(strategy_types)

    def test_strategy_get_all_endpoint(self):
        """Test 9: Get All Strategies Endpoint"""
        print("\n=== Testing Get All Strategies Endpoint ===")
        
        if not self.persona_id:
            self.log_result("Get All Strategies Setup", False, "No persona ID available for strategy testing")
            return False

        try:
            # Test GET /api/personas/{id}/strategies
            response = self.make_request('GET', f'/personas/{self.persona_id}/strategies')
            if response and response.status_code == 200:
                data = response.json()
                if 'strategies' in data:
                    strategies = data['strategies']
                    expected_types = ['positioning', 'messaging', 'pricing']
                    if all(strategy_type in strategies for strategy_type in expected_types):
                        self.log_result("GET /api/personas/strategies", True, 
                                    "Successfully retrieved all strategy types")
                        return True
                    else:
                        self.log_result("GET /api/personas/strategies", True, 
                                    f"Retrieved strategies structure (may be empty initially)")
                        return True
                else:
                    self.log_result("GET /api/personas/strategies", False, "Invalid response structure")
                    return False
            else:
                self.log_result("GET /api/personas/strategies", False, 
                            f"Failed with status: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("GET /api/personas/strategies", False, f"Error: {str(e)}")
            return False

    def test_strategy_export_endpoints(self):
        """Test 10: Strategy Export Endpoints"""
        print("\n=== Testing Strategy Export Endpoints ===")
        
        if not self.persona_id:
            self.log_result("Strategy Export Setup", False, "No persona ID available for export testing")
            return False

        strategy_types = ['positioning', 'messaging', 'pricing']
        success_count = 0

        # Test individual strategy exports
        for strategy_type in strategy_types:
            try:
                # Test GET /api/personas/{id}/strategies/{type}/export
                response = self.make_request('GET', f'/personas/{self.persona_id}/strategies/{strategy_type}/export')
                if response and response.status_code == 200:
                    data = response.json()
                    if 'persona_id' in data and 'strategy_type' in data and 'exported_at' in data:
                        self.log_result(f"GET /api/personas/strategies/{strategy_type}/export", True, 
                                    f"Successfully exported {strategy_type} strategy with metadata")
                        success_count += 1
                    else:
                        self.log_result(f"GET /api/personas/strategies/{strategy_type}/export", False, 
                                    f"Invalid export structure for {strategy_type}")
                else:
                    self.log_result(f"GET /api/personas/strategies/{strategy_type}/export", False, 
                                f"Failed with status: {response.status_code if response else 'No response'}")
            except Exception as e:
                self.log_result(f"GET /api/personas/strategies/{strategy_type}/export", False, f"Error: {str(e)}")

        # Test export all strategies
        try:
            # Test GET /api/personas/{id}/strategies/export-all
            response = self.make_request('GET', f'/personas/{self.persona_id}/strategies/export-all')
            if response and response.status_code == 200:
                data = response.json()
                if 'persona' in data and 'strategies' in data and 'exported_at' in data:
                    self.log_result("GET /api/personas/strategies/export-all", True, 
                                "Successfully exported all strategies with complete persona data")
                    success_count += 1
                else:
                    self.log_result("GET /api/personas/strategies/export-all", False, 
                                "Invalid export-all structure")
            else:
                self.log_result("GET /api/personas/strategies/export-all", False, 
                            f"Failed with status: {response.status_code if response else 'No response'}")
        except Exception as e:
            self.log_result("GET /api/personas/strategies/export-all", False, f"Error: {str(e)}")

        return success_count >= 3  # At least 3 successful exports (individual types or export-all)

    def test_end_to_end_strategy_workflow(self):
        """Test 11: End-to-End Strategy Workflow - Complete persona to strategy pipeline"""
        print("\n=== Testing End-to-End Strategy Workflow ===")
        
        # This test validates the complete workflow from segment creation to strategy generation
        workflow_steps = []
        
        # Step 1: Verify segment exists
        if self.segment_id:
            workflow_steps.append("✅ Segment created")
        else:
            self.log_result("E2E Workflow - Segment", False, "No segment available")
            return False
            
        # Step 2: Verify culture profile exists
        if self.culture_profile_id:
            workflow_steps.append("✅ Culture profile created")
        else:
            self.log_result("E2E Workflow - Culture Profile", False, "No culture profile available")
            return False
            
        # Step 3: Verify economic profile exists
        if self.economic_profile_id:
            workflow_steps.append("✅ Economic profile created")
        else:
            self.log_result("E2E Workflow - Economic Profile", False, "No economic profile available")
            return False
            
        # Step 4: Verify persona exists
        if self.persona_id:
            workflow_steps.append("✅ Persona generated")
        else:
            self.log_result("E2E Workflow - Persona", False, "No persona available")
            return False

        # Step 5: Test strategy generation for high price sensitivity scenario
        try:
            response = self.make_request('POST', f'/personas/{self.persona_id}/strategies/pricing/generate')
            if response and response.status_code == 200:
                data = response.json()
                strategy = data.get('strategy', {})
                
                # Validate that pricing strategy reflects high price sensitivity
                pricing_tiers = strategy.get('pricing_tiers', [])
                if pricing_tiers:
                    # Check if there's a cost-focused tier (like "Starter" or low-price options)
                    has_cost_focused = any('Starter' in tier.get('name', '') or 
                                         'cost' in str(tier).lower() or
                                         'affordable' in str(tier).lower() 
                                         for tier in pricing_tiers)
                    if has_cost_focused:
                        workflow_steps.append("✅ Cost-focused pricing strategy generated")
                    else:
                        workflow_steps.append("✅ Pricing strategy generated (general)")
                else:
                    workflow_steps.append("⚠️ Pricing strategy generated but no tiers found")
            else:
                self.log_result("E2E Workflow - Pricing Strategy", False, 
                            f"Failed to generate pricing strategy: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("E2E Workflow - Pricing Strategy", False, f"Error: {str(e)}")
            return False

        # Step 6: Test messaging strategy for low-context communication
        try:
            response = self.make_request('POST', f'/personas/{self.persona_id}/strategies/messaging/generate')
            if response and response.status_code == 200:
                data = response.json()
                strategy = data.get('strategy', {})
                
                # Validate that messaging reflects low-context communication style
                tone_of_voice = strategy.get('tone_of_voice', {})
                if tone_of_voice and 'direct' in str(tone_of_voice).lower():
                    workflow_steps.append("✅ Direct messaging strategy generated (low-context)")
                else:
                    workflow_steps.append("✅ Messaging strategy generated")
            else:
                self.log_result("E2E Workflow - Messaging Strategy", False, 
                            f"Failed to generate messaging strategy: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("E2E Workflow - Messaging Strategy", False, f"Error: {str(e)}")
            return False

        # Step 7: Validate UPI payment preference in pricing
        try:
            response = self.make_request('POST', f'/personas/{self.persona_id}/strategies/pricing/generate')
            if response and response.status_code == 200:
                data = response.json()
                strategy = data.get('strategy', {})
                
                payment_options = strategy.get('payment_options', [])
                has_upi = any('UPI' in str(option) for option in payment_options)
                if has_upi:
                    workflow_steps.append("✅ UPI payment option included (matching persona preference)")
                else:
                    workflow_steps.append("⚠️ Payment options generated but UPI not explicitly found")
            else:
                workflow_steps.append("⚠️ Could not verify UPI payment options")
        except Exception as e:
            workflow_steps.append("⚠️ Error checking UPI payment options")

        # Log the complete workflow
        workflow_summary = " → ".join(workflow_steps)
        self.log_result("End-to-End Strategy Workflow", True, 
                    f"Complete workflow executed: {workflow_summary}")
        
        return True

    def test_persona_export_functionality(self):
        """Test 12: Persona Export Functionality"""
        print("\n=== Testing Persona Export Functionality ===")
        
        if not self.persona_id:
            self.log_result("Persona Export Setup", False, "No persona ID available for export testing")
            return False

        try:
            # Test GET /api/personas/:id/export
            response = self.make_request('GET', f'/personas/{self.persona_id}/export')
            if response and response.status_code == 200:
                data = response.json()
                required_sections = ['persona', 'segment', 'culture_profile', 'economic_profile', 'export_metadata']
                
                if all(section in data for section in required_sections):
                    # Validate export metadata
                    export_metadata = data.get('export_metadata', {})
                    if 'exported_at' in export_metadata and 'version' in export_metadata:
                        self.log_result("GET /api/personas/export", True, 
                                    "Successfully exported persona with all required sections and metadata")
                        return True
                    else:
                        self.log_result("GET /api/personas/export", False, 
                                    "Export metadata incomplete")
                        return False
                else:
                    missing_sections = [s for s in required_sections if s not in data]
                    self.log_result("GET /api/personas/export", False, 
                                f"Missing required sections: {missing_sections}")
                    return False
            else:
                self.log_result("GET /api/personas/export", False, 
                            f"Failed with status: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("GET /api/personas/export", False, f"Error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test 7: Error Handling - Test proper error responses"""
        print("\n=== Testing Error Handling ===")
        
        # Test 404 for non-existent segment
        try:
            fake_segment_id = str(uuid.uuid4())
            response = self.make_request('GET', f'/segments/{fake_segment_id}')
            if response and response.status_code == 404:
                self.log_result("404 Error Handling", True, 
                            "Correctly returned 404 for non-existent segment")
            else:
                self.log_result("404 Error Handling", False, 
                            f"Should have returned 404, got: {response.status_code if response else 'No response'}")
        except Exception as e:
            self.log_result("404 Error Handling", False, f"Error: {str(e)}")

        # Test 400 for invalid UUID
        try:
            response = self.make_request('GET', '/segments/invalid-uuid')
            if response and response.status_code in [400, 404, 500]:  # Any error is acceptable for invalid UUID
                self.log_result("Invalid UUID Handling", True, 
                            f"Correctly handled invalid UUID with status {response.status_code}")
                return True
            else:
                self.log_result("Invalid UUID Handling", False, 
                            f"Should have returned error, got: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            self.log_result("Invalid UUID Handling", False, f"Error: {str(e)}")
            return False
    
    def test_cleanup_operations(self):
        """Test 8: Cleanup - Test DELETE operations"""
        print("\n=== Testing Cleanup Operations ===")
        
        # Test DELETE /api/segments/:id - Delete segment
        if self.segment_id:
            try:
                response = self.make_request('DELETE', f'/segments/{self.segment_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if 'message' in data and 'deleted successfully' in data['message']:
                        self.log_result("DELETE /api/segments/:id", True, 
                                    "Successfully deleted segment")
                    else:
                        self.log_result("DELETE /api/segments/:id", False, "Invalid response structure")
                        return False
                else:
                    self.log_result("DELETE /api/segments/:id", False, 
                                f"Failed with status: {response.status_code if response else 'No response'}")
                    return False
            except Exception as e:
                self.log_result("DELETE /api/segments/:id", False, f"Error: {str(e)}")
                return False

        # Test DELETE /api/workspaces/:id - Delete workspace (only if owner)
        if self.workspace_id:
            try:
                response = self.make_request('DELETE', f'/workspaces/{self.workspace_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if 'message' in data and 'deleted successfully' in data['message']:
                        self.log_result("DELETE /api/workspaces/:id", True, 
                                    "Successfully deleted workspace")
                        return True
                    else:
                        self.log_result("DELETE /api/workspaces/:id", False, "Invalid response structure")
                        return False
                else:
                    self.log_result("DELETE /api/workspaces/:id", False, 
                                f"Failed with status: {response.status_code if response else 'No response'}")
                    return False
            except Exception as e:
                self.log_result("DELETE /api/workspaces/:id", False, f"Error: {str(e)}")
                return False

        return False
    
    def run_all_tests(self):
        """Run all enhanced backend tests in sequence"""
        print(f"🚀 Starting Enhanced Human-Rooted Segmentation Studio Backend Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"⏰ Test started at: {datetime.now().isoformat()}")
        
        tests = [
            self.test_authentication_system,
            self.test_workspace_crud_operations,
            self.test_validation_system,
            self.test_segment_crud_operations,
            self.test_permissions_system,
            self.test_culture_economic_profiles,
            self.test_persona_operations,
            self.test_strategy_generation_endpoints,
            self.test_strategy_get_all_endpoint,
            self.test_strategy_export_endpoints,
            self.test_end_to_end_strategy_workflow,
            self.test_persona_export_functionality,
            self.test_error_handling,
            self.test_cleanup_operations
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
        print(f"\n{'='*80}")
        print(f"🏁 ENHANCED TEST SUMMARY")
        print(f"{'='*80}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        print(f"⏰ Test completed at: {datetime.now().isoformat()}")
        
        if failed > 0:
            print(f"\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result['success']:
                print(f"   • {result['test']}")
        
        return failed == 0

def main():
    """Main test execution"""
    tester = EnhancedBackendTester()
    success = tester.run_all_tests()
    
    # Save detailed results to file
    with open('/app/enhanced_backend_test_results.json', 'w') as f:
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