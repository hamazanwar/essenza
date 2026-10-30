// ==========================================
// CHECK WHETHER USER IS LOGGED IN
// ==========================================

export const isLoggedIn = () => {
    const token = sessionStorage.getItem("token");

    return !!token;
};


// ==========================================
// REQUIRE LOGIN
// ==========================================

export const requireLogin = (navigate, path) => {

    const token = sessionStorage.getItem("token");

    if (!token) {
        navigate("/register");
        return;
    }

    navigate(path);
};