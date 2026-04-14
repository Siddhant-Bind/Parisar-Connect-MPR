import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Contact = () => {
  return (
    <section id="contact" className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Get in touch with us
          </h2>
          <p className="text-lg text-muted-foreground">
            Have questions about pricing, setup, or features? Our team is here to help you get started.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-12 bg-card rounded-3xl shadow-elevated border border-border p-4 sm:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Contact Details */}
          <div className="lg:col-span-2 bg-gradient-hero rounded-2xl p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-foreground mb-6">Contact Information</h3>
              <p className="text-muted-foreground mb-8 text-sm leading-relaxed">Fill up the form and our team will get back to you within 24 hours.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium text-sm">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-foreground font-medium text-sm">hello@parisar.in</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-warm-orange/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-warm-orange" />
                  </div>
                  <span className="text-foreground font-medium text-sm">Mumbai, India</span>
                </div>
              </div>
            </div>
            
            {/* Decorative background shapes */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl z-0"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl z-0"></div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 p-2 sm:p-4">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-semibold text-foreground/80">First Name</Label>
                  <Input id="firstName" placeholder="Enter First Name" className="bg-muted/50 border-border rounded-xl h-12 focus-visible:ring-primary placeholder:text-gray-400" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-semibold text-foreground/80">Last Name</Label>
                  <Input id="lastName" placeholder="Enter Last Name" className="bg-muted/50 border-border rounded-xl h-12 focus-visible:ring-primary placeholder:text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-foreground/80">Email</Label>
                <Input id="email" type="email" placeholder="Enter Email address" className="bg-muted/50 border-border rounded-xl h-12 focus-visible:ring-primary placeholder:text-gray-400" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="font-semibold text-foreground/80">Message</Label>
                <textarea 
                  id="message" 
                  rows={4} 
                  placeholder="Tell us what you need..." 
                  className="w-full bg-muted/50 border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                ></textarea>
              </div>
              <Button type="submit" className="w-full sm:w-auto px-8 h-12 rounded-xl bg-gradient-warm text-primary-foreground shadow-button btn-press font-bold text-base">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
