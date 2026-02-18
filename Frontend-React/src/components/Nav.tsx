import { Link } from "react-router-dom";
import { Button } from "./Button";
import { useLocation } from "react-router-dom";

export default function Nav() {
  const location = useLocation().pathname;
  const routesWithBack = {
    "/": { backTo: "/upload", label: "Get Started" },
    "/upload": { backTo: "/", label: "Home" },
    "/train": { backTo: "/upload", label: "Back to Upload" },
  };
  const currentRoute = routesWithBack[location as keyof typeof routesWithBack];
  return (
    <nav className="border-b border-black-100 backdrop-blur-sm bg-white/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold">
            SOM
          </div>
          <h1 className="text-xl font-bold text-foreground">SOM Visualizer</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to={`${currentRoute.backTo}`}>
            <Button color="black">{currentRoute.label}</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
