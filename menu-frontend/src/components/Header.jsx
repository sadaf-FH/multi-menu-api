import { ChefHat, MapPin, Calendar } from 'lucide-react';

const Header = ({ restaurantName, location, lastUpdated }) => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-charcoal via-ink to-charcoal text-cream py-16 px-8 rounded-3xl mb-12 shadow-2xl animate-fade-in">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rust/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-olive/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-rust/20 p-3 rounded-2xl backdrop-blur-sm border border-rust/30">
            <ChefHat className="w-8 h-8 text-rust" strokeWidth={1.5} />
          </div>
          <div className="h-12 w-px bg-cream/20"></div>
          <div>
            <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
              {restaurantName}
            </h1>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 text-cream/80 ml-20">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{location}</span>
          </div>
          
          {lastUpdated && (
            <>
              <div className="w-px h-4 bg-cream/30"></div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Updated {new Date(lastUpdated).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Decorative accent line */}
        <div className="mt-8 ml-20 w-32 h-1 bg-gradient-to-r from-rust via-olive to-transparent rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;
