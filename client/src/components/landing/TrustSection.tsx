import { Building2, Users, ShieldCheck } from "lucide-react";

const stats = [
  {
    icon: Building2,
    value: "100+",
    label: "Societies",
    description: "Trust our platform",
  },
  {
    icon: Users,
    value: "10k+",
    label: "Residents",
    description: "Happy community members",
  },
  {
    icon: ShieldCheck,
    value: "99.9%",
    label: "Uptime",
    description: "Secure & Reliable",
  },
];

const TrustSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="bg-deep-navy rounded-3xl p-8 sm:p-12 lg:p-16 shadow-elevated">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trusted by communities across India
            </h2>
            <p className="text-lg text-white/70">
              Join thousands of societies who have simplified their community management.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-3 gap-8 stagger-children">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center group"
              >
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Value */}
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-lg font-semibold text-white/90 mb-1">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-sm text-white/60">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center animate-fade-in-delay-3">
            <p className="text-white/70 text-sm">
              Ready to transform your society? 
              <a href="#" className="text-primary font-semibold ml-1 hover:underline">
                Get started today →
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
