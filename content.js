// 全局变量，用于存储当前活动状态
let currentSettings = {};
const TOP_POST_AVATAR = "topPostAvatar";

const ELEMENT_MAPPING = {
    hideUserProfile: '[data-testid="SideNav_AccountSwitcher_Button"]',
    hideSidebar: '[data-testid="sidebarColumn"]',
    hideX: '[aria-label="X"]',
    hideHomepage: '[href="/home"]',
    hideSearch: '[href="/explore"]',
    hideBookmarks: '[href="/i/bookmarks"]',
    hideMessages: '[href="/messages"]',
    hideNotifications: '[href="/notifications"]',
    hideProfile: '[aria-label="个人资料"]',
    hidePosts: '[aria-label="发帖"]',
    hidePremium: '[href="/i/premium"]',
    hideLists: '[aria-label="列表"]',
    hideCommunities: '[aria-label="社群"]',
    hideOrganizations: '[href="/i/verified-orgs-signup"]',
    hideGrok: '[href="/i/grok"]',
    hideJobs: '[href="/jobs"]',
    hideMore: '[aria-label="更多菜单项"]',
    hideTopAvatar: TOP_POST_AVATAR,
};

// MutationObserver来监视DOM的变化
const observer = new MutationObserver((mutations) => {
    applyCustomizationsIfNeeded();
});

// 观察器配置
const config = { childList: true, subtree: true };

// 目标节点
const targetNode = document.body;

// 观察目标节点
observer.observe(targetNode, config);

// 检查并应用定制
function applyCustomizationsIfNeeded() {
    try {
        if (chrome?.runtime?.id) {
            chrome.storage.local.get(['settings'], function(result) {
                if (!chrome.runtime.id) {
                    console.log("Extension context lost after storage fetch.");
                    return; // 提前返回，避免进一步的错误
                }
    
                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError);
                    return; // 提前返回，避免进一步的错误
                }
    
                let settings = result.settings;
                if (!settings) {
                    settings = getDefaultSettings(); // 默认设置或错误处理
                }
                customizeTwitter(settings);
            });
        }
    } catch (error) {
        console.error('Error accessing chrome.runtime.id:', error);
    }
}


function getDefaultSettings() {
    const defaultSettings = {};
    Object.keys(ELEMENT_MAPPING).forEach(key => {
        defaultSettings[key] = true; // 将所有设置默认为 true
    });
    chrome.storage.local.set({ settings: defaultSettings });
    return defaultSettings;
}

// 功能函数，用于定制和隐藏元素
function customizeTwitter(settings) {
    if (settings) {
        Object.keys(settings).forEach(setting => {
            if (settings[setting]) { // 如果该设置被激活
                updateElement(settingsMapping(setting), 'none'); // 根据设置隐藏对应的元素
            } else {
                updateElement(settingsMapping(setting), '');
            }
        });
    }
}

function settingsMapping(setting) {
    return ELEMENT_MAPPING[setting];
}

function updateElement(selector, status) {
    if(selector == TOP_POST_AVATAR) {
        const profileLink = document.querySelector('a[data-testid="AppTabBar_Profile_Link"]');
        if (profileLink) {
            const href = profileLink.getAttribute('href');
            const userId = href.split('/').pop();
            const avarPattern = '[data-testid^="UserAvatar-Container-' + userId + '"]';
            const avatarDivs = document.querySelectorAll(avarPattern);
            avatarDivs.forEach(element => {
                element.style.display = status;
            }); 
        }
    } else {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.display = status;
        });
    }
}

// 接收来自popup.html的消息并处理存储
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'activate') {
        currentSettings = message.settings || {};
        customizeTwitter(currentSettings);
        chrome.storage.local.set({ settings: currentSettings });
    }
});

// 页面加载时初始化状态
chrome.storage.local.get(['settings'], function(result) {
    currentSettings = result.settings || {};
    customizeTwitter(currentSettings);
});

