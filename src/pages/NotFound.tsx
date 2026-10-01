import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-8xl font-bold text-gradient-primary mb-4">404</div>
        <p className="mb-6 text-xl text-muted-foreground">Sahifa topilmadi</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.05] transition-transform duration-300"
        >
          <ArrowLeft className="h-4 w-4" /> Bosh sahifaga
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
