const baseURL = "http://localhost:3001/api/";

//Users API
const login = async (username, password) => {
    const response = await fetch(baseURL+"sessions", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username: username, password: password})
    });
    if(response.ok){
        return response.json();
    }else{
        throw new Error("Insert a valid username or password")
    }
};

const getCurrentSession = async() => {
    const response = await fetch(baseURL+"sessions/current", {
        credentials: "include",
    });
    if(response.ok){
        return response.json();
    }else{
        throw new Error("User not authenticated")
    }
};

const logout = async () => {
    const response = await fetch(baseURL+"sessions/current", {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if(!response.ok){
        throw new Error("Failed to logout");
    }
}

//Proposals API
const getProposalsByUserId = async () => {
    const response = await fetch(baseURL+"proposals/id", {
        credentials: "include"
    });
    if(response.ok){
        return response.json()
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
};

const getAllProposals = async () => {
    const response = await fetch(baseURL+"proposals", {
        credentials: "include"
    });
    if(response.ok){
        return response.json()
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
};

const createProposal = async (description, budget) => {
    const response = await fetch(baseURL+"proposals", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({description, budget})
    });
    if(response.ok){
        return response.json();
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
};

const updateProposal = async(id, description, budget) => {
    const response = await fetch(baseURL+'proposals/'+id, {
        method: "PUT", 
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({description, budget})      
    });
    if(response.ok){
        return response.json();
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
};

const deleteProposal = async(id) => {
    const response = await fetch(baseURL+"proposals/"+id, {
        method: "DELETE",
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if(response.ok){
        return response.json();
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
};

//Preferences API
const addPreference = async(proposalId, score) => {
    const response = await fetch(baseURL+"preferences", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ proposalId, score})
    });
    if(response.ok){
        return response.json();
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
};

const getAllPreferences = async() => {
    const response = await fetch(baseURL+"preferences",{
        credentials: "include"
    });
    if(response.ok){
        return response.json();
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
};

const getPreferencesByUserId = async (userId) => {
    const response = await fetch(baseURL+`preferences/${userId}`, {
        credentials: "include"
    });
    if(response.ok){
        return response.json()
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
};

const deletePreference = async (proposalId) => {
    const response = await fetch(baseURL+"preferences/"+proposalId, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        }
    });
    if(response.ok){
        return response.json();
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
}

//Config API
const changePhase = async () => {
    const response = await fetch(baseURL+"phase", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if(response.ok){
        return response.json();
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
}

const setBudget = async (newBudget) => {
    const response = await fetch(baseURL+"budget", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({newBudget})
    });
    if(response.ok){
        return response.json();
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
}

const getPhase = async() => {
    const response = await fetch(baseURL+"currentphase", {
        credentials: 'include'
    });
    if(response.ok){
        return response.json();
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
}

const getBudget = async() => {
    const response = await fetch(baseURL+"getbudget", {
        credentials: 'include'
    });
    if(response.ok){
        return response.json();
    }else{
        const error = await response.json();
        throw new Error(error.error);
    }
}

const reset = async() => {
    const response = await fetch(baseURL+"reset", {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if(!response.ok){
        const error = await response.json();
        throw new Error(error.error);
    }
}

const API = {login, getCurrentSession, logout, getProposalsByUserId, getAllProposals, createProposal, updateProposal, deleteProposal, addPreference, getAllPreferences, getPreferencesByUserId, deletePreference, changePhase, setBudget, getPhase, getBudget, reset};
export default API;