// ==========================================
// CHECK WHETHER USER IS LOGGED IN
// ==========================================

export const isLoggedIn = () => {
    const token = localStorage.getItem("token");

    return !!token;
};


// ==========================================
// REQUIRE LOGIN
// ==========================================

export const requireLogin = (navigate, path) => {

    const token = localStorage.getItem("token");

    if (!token) {
        navigate("/register");
        return;
    }

    navigate(path);
};