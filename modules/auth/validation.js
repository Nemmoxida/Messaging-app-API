export default function validation(req, res) {
  if (!req.headers.authorization) {
    res.redirect("/signup");
  }
}
