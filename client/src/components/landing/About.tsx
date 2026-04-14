import { Target, Users, Zap } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-24 px-4 overflow-hidden relative">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Illustration / Visuals */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto rounded-full bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent absolute -inset-4 blur-3xl opacity-50"></div>
            <div className="relative bg-card border border-border shadow-elevated rounded-3xl p-8 max-w-md mx-auto transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex gap-4 mb-6">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                   <Users className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                   <h4 className="font-bold text-foreground">Community First</h4>
                   <p className="text-sm text-muted-foreground">Built around people, fostering communication and deeper bonds.</p>
                 </div>
              </div>
              <div className="flex gap-4 mb-6">
                 <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center overflow-hidden shrink-0">
                   <Target className="w-6 h-6 text-secondary" />
                 </div>
                 <div>
                   <h4 className="font-bold text-foreground">Mission Driven</h4>
                   <p className="text-sm text-muted-foreground">Dedicated to simplifying administration and prioritizing security.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-xl bg-warm-orange/10 flex items-center justify-center overflow-hidden shrink-0">
                   <Zap className="w-6 h-6 text-warm-orange" />
                 </div>
                 <div>
                   <h4 className="font-bold text-foreground">Modern & Fast</h4>
                   <p className="text-sm text-muted-foreground">A lightning quick platform with state of the art aesthetics.</p>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Right: Text */}
          <div className="max-w-xl mx-auto lg:mx-0">
            <h2 className="text-sm font-bold text-primary tracking-wider uppercase mb-3 text-center lg:text-left">About Parisar Connect</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-6 leading-tight text-center lg:text-left">
              Bridging the gap between <span className="text-secondary">management</span> and <span className="text-primary">residents</span>.
            </h3>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed text-center lg:text-left">
              We started Parisar Connect with a simple idea: that managing a society shouldn't require endless phone calls, scattered WhatsApp groups, and chaotic paper registers. 
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed text-center lg:text-left">
              Our platform brings residents, committees, and security guards together into one seamless digital ecosystem. We believe in transparency, security, and making community living truly peaceful.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
