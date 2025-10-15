#!/usr/bin/env python3
"""
Quick test of enhanced features
"""

import requests
import json

BASE_URL = "https://rooted-personas.preview.emergentagent.com/api"

def test_validation():
    """Test validation system"""
    print("Testing validation system...")
    
    # Test blocked term
    response = requests.post(
        f"{BASE_URL}/workspaces?demo=true",
        json={"name": "Workspace with religion"},
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 400 and "Content validation failed" in response.json().get("error", ""):
        print("✅ Validation working correctly")
        return True
    else:
        print("❌ Validation not working")
        return False

def test_workspace_crud():
    """Test workspace CRUD"""
    print("\nTesting workspace CRUD...")
    
    # Create workspace
    create_response = requests.post(
        f"{BASE_URL}/workspaces?demo=true",
        json={"name": "Test Workspace"},
        headers={'Content-Type': 'application/json'}
    )
    
    if create_response.status_code == 200:
        workspace_id = create_response.json()["workspace"]["id"]
        print(f"✅ Created workspace: {workspace_id}")
        
        # Update workspace
        update_response = requests.put(
            f"{BASE_URL}/workspaces/{workspace_id}?demo=true",
            json={"name": "Updated Test Workspace"},
            headers={'Content-Type': 'application/json'}
        )
        
        if update_response.status_code == 200:
            print("✅ Updated workspace")
        else:
            print(f"❌ Failed to update workspace: {update_response.status_code}")
            
        # Delete workspace
        delete_response = requests.delete(f"{BASE_URL}/workspaces/{workspace_id}?demo=true")
        
        if delete_response.status_code == 200:
            print("✅ Deleted workspace")
            return True
        else:
            print(f"❌ Failed to delete workspace: {delete_response.status_code}")
            return False
    else:
        print(f"❌ Failed to create workspace: {create_response.status_code}")
        return False

def test_segment_crud():
    """Test segment CRUD"""
    print("\nTesting segment CRUD...")
    
    # First create a workspace
    workspace_response = requests.post(
        f"{BASE_URL}/workspaces?demo=true",
        json={"name": "Test Workspace for Segments"},
        headers={'Content-Type': 'application/json'}
    )
    
    if workspace_response.status_code != 200:
        print("❌ Failed to create workspace for segment test")
        return False
        
    workspace_id = workspace_response.json()["workspace"]["id"]
    
    # Create segment
    segment_data = {
        "name": "Test Segment",
        "workspaceId": workspace_id,
        "values": ["efficiency", "growth"],
        "emotions": ["confidence"],
        "fears": ["complexity"]
    }
    
    create_response = requests.post(
        f"{BASE_URL}/segments?demo=true",
        json=segment_data,
        headers={'Content-Type': 'application/json'}
    )
    
    if create_response.status_code == 200:
        segment_id = create_response.json()["segment"]["id"]
        print(f"✅ Created segment: {segment_id}")
        
        # Get segment
        get_response = requests.get(f"{BASE_URL}/segments/{segment_id}?demo=true")
        
        if get_response.status_code == 200:
            print("✅ Retrieved segment")
        else:
            print(f"❌ Failed to get segment: {get_response.status_code}")
            
        # Update segment
        update_response = requests.put(
            f"{BASE_URL}/segments/{segment_id}?demo=true",
            json={"name": "Updated Test Segment", "workspaceId": workspace_id},
            headers={'Content-Type': 'application/json'}
        )
        
        if update_response.status_code == 200:
            print("✅ Updated segment")
        else:
            print(f"❌ Failed to update segment: {update_response.status_code}")
            
        # Delete segment
        delete_response = requests.delete(f"{BASE_URL}/segments/{segment_id}?demo=true")
        
        if delete_response.status_code == 200:
            print("✅ Deleted segment")
        else:
            print(f"❌ Failed to delete segment: {delete_response.status_code}")
            
        # Cleanup workspace
        requests.delete(f"{BASE_URL}/workspaces/{workspace_id}?demo=true")
        return True
    else:
        print(f"❌ Failed to create segment: {create_response.status_code}")
        # Cleanup workspace
        requests.delete(f"{BASE_URL}/workspaces/{workspace_id}?demo=true")
        return False

if __name__ == "__main__":
    print("🚀 Quick Enhanced Features Test")
    print("=" * 50)
    
    results = []
    results.append(test_validation())
    results.append(test_workspace_crud())
    results.append(test_segment_crud())
    
    passed = sum(results)
    total = len(results)
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    if passed == total:
        print("🎉 All enhanced features working!")
    else:
        print("⚠️  Some features need attention")