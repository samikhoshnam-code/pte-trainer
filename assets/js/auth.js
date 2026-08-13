/* =========================================================
   PTE TRAINER AUTHENTICATION
========================================================= */

const AUTH_USERS_KEY =
    "pte_trainer_users";

const CURRENT_USER_KEY =
    "pte_trainer_current_user";


/* =========================================================
   GET USERS
========================================================= */

function getUsers() {

    try {

        const saved =
            localStorage.getItem(
                AUTH_USERS_KEY
            );


        if (!saved) {

            return {};

        }


        return JSON.parse(
            saved
        );

    } catch (error) {

        console.error(
            "Could not load users:",
            error
        );

        return {};

    }

}


/* =========================================================
   SAVE USERS
========================================================= */

function saveUsers(
    users
) {

    localStorage.setItem(
        AUTH_USERS_KEY,
        JSON.stringify(
            users
        )
    );

}


/* =========================================================
   NORMALIZE USERNAME
========================================================= */

function normalizeUsername(
    username
) {

    return String(
        username || ""
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   HASH PASSWORD
========================================================= */

async function hashPassword(
    password
) {

    const encoder =
        new TextEncoder();


    const data =
        encoder.encode(
            password
        );


    const hash =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );


    return Array
        .from(
            new Uint8Array(
                hash
            )
        )
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(
                        2,
                        "0"
                    )
        )
        .join("");

}


/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUser() {

    return localStorage.getItem(
        CURRENT_USER_KEY
    );

}


function isLoggedIn() {

    return !!getCurrentUser();

}


/* =========================================================
   USER-SPECIFIC STORAGE KEY
========================================================= */

function getUserStorageKey(
    baseKey
) {

    const username =
        getCurrentUser();


    if (!username) {

        return baseKey;

    }


    return (
        baseKey +
        "::" +
        normalizeUsername(
            username
        )
    );

}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser() {

    const usernameInput =
        document.getElementById(
            "login-username"
        );


    const passwordInput =
        document.getElementById(
            "login-password"
        );


    const message =
        document.getElementById(
            "login-message"
        );


    if (
        !usernameInput ||
        !passwordInput
    ) {

        return;

    }


    const username =
        normalizeUsername(
            usernameInput.value
        );


    const password =
        passwordInput.value;


    if (
        !username ||
        !password
    ) {

        showAuthMessage(
            message,
            "Please enter username and password.",
            "error"
        );

        return;

    }


    const users =
        getUsers();


    const user =
        users[
            username
        ];


    if (!user) {

        showAuthMessage(
            message,
            "Username or password is incorrect.",
            "error"
        );

        return;

    }


    try {

        const passwordHash =
            await hashPassword(
                password
            );


        if (
            passwordHash !==
            user.passwordHash
        ) {

            showAuthMessage(
                message,
                "Username or password is incorrect.",
                "error"
            );

            return;

        }


        localStorage.setItem(
            CURRENT_USER_KEY,
            username
        );


        window.location.href =
            "index.html";

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showAuthMessage(
            message,
            "Login failed. Please try again.",
            "error"
        );

    }

}


/* =========================================================
   REGISTER
========================================================= */

async function registerUser() {

    const usernameInput =
        document.getElementById(
            "register-username"
        );


    const passwordInput =
        document.getElementById(
            "register-password"
        );


    const confirmInput =
        document.getElementById(
            "register-password-confirm"
        );


    const message =
        document.getElementById(
            "register-message"
        );


    if (
        !usernameInput ||
        !passwordInput ||
        !confirmInput
    ) {

        return;

    }


    const username =
        normalizeUsername(
            usernameInput.value
        );


    const password =
        passwordInput.value;


    const confirmation =
        confirmInput.value;


    if (!username) {

        showAuthMessage(
            message,
            "Please choose a username.",
            "error"
        );

        return;

    }


    if (
        username.length < 3
    ) {

        showAuthMessage(
            message,
            "Username must contain at least 3 characters.",
            "error"
        );

        return;

    }


    if (
        !/^[a-z0-9_.-]+$/.test(
            username
        )
    ) {

        showAuthMessage(
            message,
            "Username can contain letters, numbers, dot, dash and underscore.",
            "error"
        );

        return;

    }


    if (
        password.length < 6
    ) {

        showAuthMessage(
            message,
            "Password must contain at least 6 characters.",
            "error"
        );

        return;

    }


    if (
        password !==
        confirmation
    ) {

        showAuthMessage(
            message,
            "Passwords do not match.",
            "error"
        );

        return;

    }


    const users =
        getUsers();


    if (
        users[
            username
        ]
    ) {

        showAuthMessage(
            message,
            "This username already exists.",
            "error"
        );

        return;

    }


    try {

        const passwordHash =
            await hashPassword(
                password
            );


        users[
            username
        ] = {

            username:
                username,

            passwordHash:
                passwordHash,

            createdAt:
                new Date().toISOString()

        };


        saveUsers(
            users
        );


        localStorage.setItem(
            CURRENT_USER_KEY,
            username
        );


        window.location.href =
            "index.html";

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showAuthMessage(
            message,
            "Registration failed. Please try again.",
            "error"
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    localStorage.removeItem(
        CURRENT_USER_KEY
    );


    window.location.href =
        "auth.html";

}


/* =========================================================
   AUTH MESSAGE
========================================================= */

function showAuthMessage(
    element,
    text,
    type
) {

    if (!element) {

        return;

    }


    element.textContent =
        text;


    element.className =
        "auth-message " +
        type;

}


/* =========================================================
   LOGIN TAB
========================================================= */

function showLogin() {

    const loginForm =
        document.getElementById(
            "login-form"
        );


    const registerForm =
        document.getElementById(
            "register-form"
        );


    const loginTab =
        document.getElementById(
            "login-tab"
        );


    const registerTab =
        document.getElementById(
            "register-tab"
        );


    if (loginForm) {

        loginForm.classList.remove(
            "hidden"
        );

    }


    if (registerForm) {

        registerForm.classList.add(
            "hidden"
        );

    }


    if (loginTab) {

        loginTab.classList.add(
            "active"
        );

    }


    if (registerTab) {

        registerTab.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   REGISTER TAB
========================================================= */

function showRegister() {

    const loginForm =
        document.getElementById(
            "login-form"
        );


    const registerForm =
        document.getElementById(
            "register-form"
        );


    const loginTab =
        document.getElementById(
            "login-tab"
        );


    const registerTab =
        document.getElementById(
            "register-tab"
        );


    if (registerForm) {

        registerForm.classList.remove(
            "hidden"
        );

    }


    if (loginForm) {

        loginForm.classList.add(
            "hidden"
        );

    }


    if (registerTab) {

        registerTab.classList.add(
            "active"
        );

    }


    if (loginTab) {

        loginTab.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   CREATE ACCOUNT DRAWER
========================================================= */

function createAccountSidebar() {

    const currentUser =
        getCurrentUser();


    if (!currentUser) {

        console.log(
            "No logged-in user."
        );

        return;

    }


    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (
        page === "auth.html"
    ) {

        return;

    }


    if (
        document.getElementById(
            "account-toggle"
        )
    ) {

        return;

    }


    /* =====================================================
       ACCOUNT TOGGLE
    ===================================================== */

    const toggle =
        document.createElement(
            "button"
        );


    toggle.id =
        "account-toggle";

    toggle.type =
        "button";

    toggle.className =
        "account-toggle";

    toggle.setAttribute(
        "aria-label",
        "Open account menu"
    );

    toggle.innerHTML =
        "👤";


    document.body.appendChild(
        toggle
    );


    /* =====================================================
       ACCOUNT SIDEBAR
    ===================================================== */

    const sidebar =
        document.createElement(
            "aside"
        );


    sidebar.id =
        "account-sidebar";

    sidebar.className =
        "account-sidebar";


    sidebar.innerHTML = `

        <div
            class="
                account-sidebar-inner
            "
        >

            <div
                class="
                    account-profile
                "
            >

                <div
                    class="
                        account-avatar
                    "
                >

                    ${getInitial(
                        currentUser
                    )}

                </div>


                <div
                    class="
                        account-user-info
                    "
                >

                    <strong>

                        ${escapeAccountHtml(
                            currentUser
                        )}

                    </strong>


                    <span>

                        ● Logged in

                    </span>

                </div>

            </div>


            <div
                class="
                    account-divider
                "
            ></div>


            <button
                type="button"
                class="
                    account-menu-btn
                "
                onclick="
                    showAccountInfo()
                "
            >

                <span
                    class="
                        account-menu-icon
                    "
                >

                    👤

                </span>


                <span>

                    Account Info

                </span>

            </button>


            <button
                type="button"
                class="
                    account-menu-btn
                "
                onclick="
                    showChangePassword()
                "
            >

                <span
                    class="
                        account-menu-icon
                    "
                >

                    🔑

                </span>


                <span>

                    Change Password

                </span>

            </button>


            <div
                class="
                    account-divider
                "
            ></div>


            <button
                type="button"
                class="
                    account-menu-btn
                    logout-btn
                "
                onclick="
                    logoutUser()
                "
            >

                <span
                    class="
                        account-menu-icon
                    "
                >

                    🚪

                </span>


                <span>

                    Logout

                </span>

            </button>

        </div>

    `;


    document.body.appendChild(
        sidebar
    );


    /* =====================================================
       OVERLAY
    ===================================================== */

    const drawerOverlay =
        document.createElement(
            "div"
        );


    drawerOverlay.id =
        "account-drawer-overlay";

    drawerOverlay.className =
        "account-drawer-overlay";


    document.body.appendChild(
        drawerOverlay
    );


    /* =====================================================
       MODAL OVERLAY
    ===================================================== */

    createAccountModalOverlay();


    /* =====================================================
       EVENTS
    ===================================================== */

    toggle.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            toggleAccountDrawer();

        }
    );


    drawerOverlay.addEventListener(
        "click",
        function() {

            closeAccountDrawer();

        }
    );


    console.log(
        "Account drawer created for:",
        currentUser
    );

}


/* =========================================================
   OPEN DRAWER
========================================================= */

function openAccountDrawer() {

    const sidebar =
        document.getElementById(
            "account-sidebar"
        );


    const overlay =
        document.getElementById(
            "account-drawer-overlay"
        );


    if (sidebar) {

        sidebar.classList.add(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.add(
            "show"
        );

    }

}


/* =========================================================
   CLOSE DRAWER
========================================================= */

function closeAccountDrawer() {

    const sidebar =
        document.getElementById(
            "account-sidebar"
        );


    const overlay =
        document.getElementById(
            "account-drawer-overlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   TOGGLE DRAWER
========================================================= */

function toggleAccountDrawer() {

    const sidebar =
        document.getElementById(
            "account-sidebar"
        );


    if (!sidebar) {

        console.error(
            "Account sidebar not found."
        );

        return;

    }


    if (
        sidebar.classList.contains(
            "open"
        )
    ) {

        closeAccountDrawer();

    } else {

        openAccountDrawer();

    }

}


/* =========================================================
   MODAL OVERLAY
========================================================= */

function createAccountModalOverlay() {

    if (
        document.getElementById(
            "account-overlay"
        )
    ) {

        return;

    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "account-overlay";

    overlay.className =
        "account-overlay";


    overlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                overlay
            ) {

                closeAccountModal();

            }

        }
    );


    document.body.appendChild(
        overlay
    );

}


/* =========================================================
   ACCOUNT INFO
========================================================= */

function showAccountInfo() {

    closeAccountDrawer();


    const username =
        getCurrentUser();


    if (!username) {

        return;

    }


    const users =
        getUsers();


    const user =
        users[
            normalizeUsername(
                username
            )
        ];


    if (!user) {

        return;

    }


    const created =
        user.createdAt
            ? formatAccountDate(
                user.createdAt
            )
            : "Unknown";


    showAccountModal(`

        <div
            class="
                account-modal-header
            "
        >

            <div
                class="
                    account-modal-icon
                "
            >

                👤

            </div>


            <div>

                <h2>

                    Account Info

                </h2>


                <p>

                    Your PTE Trainer account

                </p>

            </div>

        </div>


        <div
            class="
                account-info-grid
            "
        >

            <div
                class="
                    account-info-row
                "
            >

                <span>

                    Username

                </span>


                <strong>

                    ${escapeAccountHtml(
                        username
                    )}

                </strong>

            </div>


            <div
                class="
                    account-info-row
                "
            >

                <span>

                    Member since

                </span>


                <strong>

                    ${created}

                </strong>

            </div>

        </div>


        <button
            type="button"
            class="
                account-modal-secondary
            "
            onclick="
                closeAccountModal()
            "
        >

            Close

        </button>

    `);

}


/* =========================================================
   CHANGE PASSWORD
========================================================= */

function showChangePassword() {

    closeAccountDrawer();


    showAccountModal(`

        <div
            class="
                account-modal-header
            "
        >

            <div
                class="
                    account-modal-icon
                "
            >

                🔑

            </div>


            <div>

                <h2>

                    Change Password

                </h2>


                <p>

                    Update your account password

                </p>

            </div>

        </div>


        <div
            class="
                account-password-form
            "
        >

            <input
                id="current-password"
                type="password"
                placeholder="Current Password"
            >


            <input
                id="new-password"
                type="password"
                placeholder="New Password"
            >


            <input
                id="confirm-new-password"
                type="password"
                placeholder="Confirm New Password"
            >


            <div
                id="
                    change-password-message
                "
                class="
                    account-message
                "
            ></div>


            <button
                type="button"
                class="
                    account-modal-primary
                "
                onclick="
                    changePassword()
                "
            >

                Update Password

            </button>


            <button
                type="button"
                class="
                    account-modal-secondary
                "
                onclick="
                    closeAccountModal()
                "
            >

                Cancel

            </button>

        </div>

    `);

}


/* =========================================================
   CHANGE PASSWORD
========================================================= */

async function changePassword() {

    const currentInput =
        document.getElementById(
            "current-password"
        );


    const newInput =
        document.getElementById(
            "new-password"
        );


    const confirmInput =
        document.getElementById(
            "confirm-new-password"
        );


    const message =
        document.getElementById(
            "change-password-message"
        );


    if (
        !currentInput ||
        !newInput ||
        !confirmInput
    ) {

        return;

    }


    const currentPassword =
        currentInput.value;


    const newPassword =
        newInput.value;


    const confirmPassword =
        confirmInput.value;


    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        showAccountMessage(
            message,
            "Please fill in all fields.",
            "error"
        );

        return;

    }


    if (
        newPassword.length <
        6
    ) {

        showAccountMessage(
            message,
            "New password must contain at least 6 characters.",
            "error"
        );

        return;

    }


    if (
        newPassword !==
        confirmPassword
    ) {

        showAccountMessage(
            message,
            "New passwords do not match.",
            "error"
        );

        return;

    }


    const username =
        getCurrentUser();


    if (!username) {

        return;

    }


    const users =
        getUsers();


    const user =
        users[
            normalizeUsername(
                username
            )
        ];


    if (!user) {

        showAccountMessage(
            message,
            "Account not found.",
            "error"
        );

        return;

    }


    try {

        const currentHash =
            await hashPassword(
                currentPassword
            );


        if (
            currentHash !==
            user.passwordHash
        ) {

            showAccountMessage(
                message,
                "Current password is incorrect.",
                "error"
            );

            return;

        }


        user.passwordHash =
            await hashPassword(
                newPassword
            );


        saveUsers(
            users
        );


        showAccountMessage(
            message,
            "Password changed successfully.",
            "success"
        );


        currentInput.value =
            "";

        newInput.value =
            "";

        confirmInput.value =
            "";

    } catch (error) {

        console.error(
            "Password change error:",
            error
        );


        showAccountMessage(
            message,
            "Could not change password.",
            "error"
        );

    }

}


/* =========================================================
   SHOW MODAL
========================================================= */

function showAccountModal(
    html
) {

    const overlay =
        document.getElementById(
            "account-overlay"
        );


    if (!overlay) {

        return;

    }


    overlay.innerHTML = `

        <div
            class="
                account-modal
            "
        >

            <button
                type="button"
                class="
                    account-modal-close
                "
                onclick="
                    closeAccountModal()
                "
            >

                ×

            </button>


            ${html}

        </div>

    `;


    overlay.classList.add(
        "show"
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeAccountModal() {

    const overlay =
        document.getElementById(
            "account-overlay"
        );


    if (!overlay) {

        return;

    }


    overlay.classList.remove(
        "show"
    );


    overlay.innerHTML =
        "";

}


/* =========================================================
   ACCOUNT MESSAGE
========================================================= */

function showAccountMessage(
    element,
    text,
    type
) {

    if (!element) {

        return;

    }


    element.textContent =
        text;


    element.className =
        "account-message " +
        type;

}


/* =========================================================
   HELPERS
========================================================= */

function getInitial(
    username
) {

    const value =
        String(
            username || "?"
        ).trim();


    if (!value) {

        return "?";

    }


    return value
        .charAt(0)
        .toUpperCase();

}


function escapeAccountHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

}


function formatAccountDate(
    value
) {

    try {

        return new Date(
            value
        ).toLocaleDateString(
            "en-US",
            {
                year:
                    "numeric",

                month:
                    "short",

                day:
                    "numeric"
            }
        );

    } catch {

        return "Unknown";

    }

}


/* =========================================================
   PROTECTION
========================================================= */

function requireLogin() {

    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (
        page === "auth.html" ||
        page === ""
    ) {

        return;

    }


    if (
        !isLoggedIn()
    ) {

        window.location.href =
            "auth.html";

    }

}


function handleAuthPage() {

    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (
        page !== "auth.html"
    ) {

        return;

    }


    if (
        isLoggedIn()
    ) {

        window.location.href =
            "index.html";

    }

}


/* =========================================================
   INIT
========================================================= */

function initAccountSystem() {

    handleAuthPage();

    requireLogin();


    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (
        page === "auth.html"
    ) {

        return;

    }


    createAccountSidebar();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initAccountSystem
    );

} else {

    initAccountSystem();

}
