// Permanently redirects the old and typo domains to focuship.app, keeping the path and query.
const ORIGIN = "https://focuship.app";

const redirect = {
  fetch(request) {
    const { pathname, search } = new URL(request.url);
    return Response.redirect(`${ORIGIN}${pathname}${search}`, 301);
  },
};

export default redirect;
