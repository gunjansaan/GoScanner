
const baseURL = "http://localhost:8091/api/v1/";
// const baseURL = "http://192.168.238.63:8091/api/v1/";

/**
 * Send data to a REST endpoint and handle errors
 * @param {string} endpoint - The REST API endpoint URL
 * @param {Object} data - The data object to be sent
 * @returns {Promise<Object|null>} - Returns the response JSON or null on error
 */


async function requestEndPoint(endpoint, data, method) {
    let token = localStorage.getItem("authToken")
    console.log("called");

    try {
        let reqHeaders = new Headers();
        if (token != null) {
            reqHeaders.append('Authorization', `Bearer ${token}`);
        }
        reqHeaders.append('Content-Type', 'application/json');

        const response = await fetch(`${baseURL}${endpoint}`, {
            method: method,
            headers: reqHeaders,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert(`Error ${response.status}: ${errorText}`);
            return null;
        }

        const result = await response.json();
        return result;

    } catch (error) {
        alert(`Network error: ${error.message}`);
        return null;
    }
}

/**
 * Safely revome all data from browser cache on logout
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('company-name');
    localStorage.removeItem('companyId');
}
/**
 * Send data to a REST endpoint and handle errors
 * @param {Object} jsonData - The data object to be sent
 * @param {Object} file - The File to be uploaded
 * @returns {Promise<Object|null>} - Returns the response JSON or null on error
 */
async function uploadDataset(jsonData, file) {
    const formData = new FormData();

    const blob = new Blob([JSON.stringify(jsonData)], { type: "application/json" });
    formData.append("data", blob);
    formData.append("file", file);

    let token = localStorage.getItem("authToken");
    let companyId = localStorage.getItem("companyId");
    let reqHeaders = new Headers();
    if (token != null) {
        reqHeaders.append('Authorization', `Bearer ${token}`);
    }
    try {
        const response = await fetch(`${baseURL}dataset/${companyId}`, {
            method: 'POST',
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // },
            headers: reqHeaders,
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert(`Error ${response.status}: ${errorText}`);
            return null;
            
        }
        window.location.reload();
        console.log(localStorage.getItem('companyId'))
        const result = await response.json();
        return result;

    } catch (error) {
        alert(`Network error: ${error.message}`);
        return null;
    }

}


async function loadDatasetEntries() {
    const token = localStorage.getItem('authToken');
    const companyId = localStorage.getItem('companyId');

    if (!token || !companyId) {
        alert("Missing authentication token or company ID.");
        return null;
    }

    try {
        const response = await fetch(`${baseURL}company/${companyId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert(`Error ${response.status}: ${errorText}`);
            return null;
       }

        const result = await response.json();
        return result.datasets || [];;
    } catch (error) {
        alert(`Network error: ${error.message}`);
        return null;
    }
}


function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count > 0) {
            return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}

/**
 * Send a reset password request
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
async function forgetPasswordWithEmail(email) {
    try {
        // http://localhost:8091/api/v1/forger-password?email=harshitapandey492%40gmail.com
        const response = await fetch(`${baseURL}pm/forgot-password/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert(`Error ${response.status}: ${errorText}`);
            return null;
        }

        const result = await response.json();
        alert('Password reset successful!');
        return result;

    } catch (error) {
        alert(`Network error: ${error.message}`);
        return null;
    }
}

// [TODO] Added 
function downloadFile(url, filename) {
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': localStorage.getItem('authToken')
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log(response.statusText);
            return response.blob();
        })
        .then(blob => {
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        })
        .catch(error => {
            console.error('Download error:', error);
            alert('Failed to download file.');
        });
}


async function resetPassword(resetToken, data)  {
    try {
        console.log(data);
        console.log(resetToken);
        const response = await fetch(`${baseURL}pm/reset?token=${resetToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        

        if (!response.ok) {
            const errorText = JSON.parse(await response.text());
            alert(`Error ${response.status}: ${errorText.message}`);
            return null;
        }

        const result = await response.text();
        alert(result);
        return null;

    } catch (error) {
        alert(`Network error: ${error.message}`);
        return null;
    }
}

async function qrMetadtaCollector(userId) {
    const token = localStorage.getItem('authToken');
            
    try {
        const response = await fetch(`${baseURL}users/qr/1${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert(`Error ${response.status}: ${errorText}`);
            return null;
        }

        const result = await response.json();
        console.log(result);
        // return result.datasets || [];;
    } catch (error) {
        alert(`Network error: ${error.message}`);
        return null;
    }
}