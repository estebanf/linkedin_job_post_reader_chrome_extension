// Function to get the post content
function getPostContent() {
    const selector = '#main > div > div.scaffold-layout__list-detail-inner.scaffold-layout__list-detail-inner--grow > div.scaffold-layout__detail.overflow-x-hidden.jobs-search__job-details > div';
    const element = document.querySelector(selector);
    
    if (element) {
        return {
            html: element.outerHTML,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
    }
    return null;
}

// Function to send data to the webservice
async function sendToWebservice(data) {
    console.log('Sending data to webservice:', data);
    try {
        const response = await fetch('http://localhost:8000/job_post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': window.location.origin,
                'Access-Control-Allow-Origin': '*'
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                body: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Post content successfully sent to webservice:', result);
        return result;
    } catch (error) {
        console.error('Error sending post content:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            cause: error.cause
        });
        throw error; // Re-throw to handle in the caller
    }
}

// Keep track of whether we're currently processing a request
let isProcessing = false;

// Remove any existing listeners before adding a new one
chrome.runtime.onMessage.removeListener(handleMessage);

// Message handler function
async function handleMessage(request, sender, sendResponse) {
    if (request.action === 'collectPost') {
        // Prevent multiple simultaneous requests
        if (isProcessing) {
            sendResponse({ success: false, message: 'Already processing a request' });
            return true;
        }

        try {
            isProcessing = true;
            const postContent = getPostContent();
            
            if (postContent) {
                await sendToWebservice(postContent);
                sendResponse({ success: true, message: 'Content collected and sent' });
            } else {
                sendResponse({ success: false, message: 'Content not found on page' });
            }
        } catch (error) {
            sendResponse({ success: false, message: `Failed to send content: ${error.message}` });
        } finally {
            isProcessing = false;
        }
    }
    return true; // Required for async response
}

// Add the message listener
chrome.runtime.onMessage.addListener(handleMessage); 