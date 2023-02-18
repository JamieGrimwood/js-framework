class Router {
    constructor() {
        this.routes = [];
    }

    add(path, callback) {
        this.routes.push({ path, callback });
    }

    navigate(path) {
        const route = this.routes.find(route => route.path === path);

        if (route) {
            history.pushState({}, null, path);
            route.callback();
        } else {
            console.error(`Route not found: ${path}`);
        }
    }

    render(content) {
        document.getElementById("anidthatmostwebsitesshouldnothavebecauseiftheydothatisweirdandthiswillavoidinterferancewithwebsites").innerHTML = content;

        // Replace local links with router.navigate
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('//') && !href.startsWith('http') && !href.startsWith('https')) {
                link.addEventListener('click', event => {
                    event.preventDefault();
                    this.navigate(href);
                });
            }
        });

        // Replace window.location.href with router.navigate
        const locationHref = document.querySelectorAll('[onclick*="window.location.href"]');
        locationHref.forEach(link => {
            const href = link.getAttribute('onclick');
            if (href && href.includes('window.location.href') && !href.startsWith('//') && !href.startsWith('http') && !href.startsWith('https')) {
                link.addEventListener('click', event => {
                    event.stopPropagation();
                    const href2 = href.match(/window.location.href\s*=\s*['"](.+?)['"]/)[1];
                    router.navigate(href2);
                });
                link.removeAttribute('onclick');
            }
        });
    }

}

const router = new Router();

pages.forEach(page => {
    router.add(page.path, () => {
        router.render(page.content);
    });
})

window.addEventListener("load", () => {
    router.navigate(window.location.pathname);
});