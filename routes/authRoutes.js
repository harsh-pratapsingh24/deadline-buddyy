router.get("/login", auth.getLogin);
router.post("/login", auth.postLogin);

router.get("/register", auth.getRegister);
router.post("/register", auth.postRegister);

router.get("/logout", auth.logout);
