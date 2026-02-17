import { Home, Shield, Megaphone, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Home,
    title: "Resident Management",
    description:
      "Effortlessly manage resident profiles, family members, and tenant records in one place.",
    bgColor: "bg-soft-peach",
    iconColor: "text-primary",
  },
  {
    icon: Shield,
    title: "Secure Visitor Logs",
    description:
      "Track and verify every visitor with digital entry passes and real-time notifications.",
    bgColor: "bg-mint-green",
    iconColor: "text-secondary",
  },
  {
    icon: Megaphone,
    title: "Society Announcements",
    description:
      "Share important updates, events, and notices instantly with all residents.",
    bgColor: "bg-light-yellow",
    iconColor: "text-warm-orange",
  },
  {
    icon: BarChart3,
    title: "Smart Admin Controls",
    description:
      "Powerful dashboard for admins to manage maintenance, payments, and reports.",
    bgColor: "bg-soft-peach/60",
    iconColor: "text-deep-navy",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="py-20 px-4 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything you need for{" "}
            <span className="text-primary">peaceful living</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple, intuitive tools designed to make community management feel
            effortless.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-6 shadow-card card-hover cursor-default"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
