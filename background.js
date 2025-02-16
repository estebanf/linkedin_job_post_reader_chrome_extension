// Listen for extension button clicks
chrome.action.onClicked.addListener(async (tab) => {
    // Only run on linkedin.com domains
    if (tab.url.includes('linkedin.com')) {
        try {
            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'collectPost' });
            
            if (response && response.success) {
                // Show success notification
                chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
                setTimeout(() => {
                    chrome.action.setBadgeText({ text: '', tabId: tab.id });
                }, 2000);
            } else {
                // Show error notification
                chrome.action.setBadgeText({ text: '✗', tabId: tab.id });
                setTimeout(() => {
                    chrome.action.setBadgeText({ text: '', tabId: tab.id });
                }, 2000);
            }
        } catch (error) {
            console.error('Error:', error);
            // Show error notification
            chrome.action.setBadgeText({ text: '✗', tabId: tab.id });
            setTimeout(() => {
                chrome.action.setBadgeText({ text: '', tabId: tab.id });
            }, 2000);
        }
    }
}); 