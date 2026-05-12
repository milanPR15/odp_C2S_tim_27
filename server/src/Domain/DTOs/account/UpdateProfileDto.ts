export class UpdateProfileDto {
  constructor(
    public gamer_tag?: string,
    public full_name?: string,
    public email?: string,
    public password?: string,           
    public profile_image?: string       
  ) {}

  isValid(): boolean {
    if (this.gamer_tag && (this.gamer_tag.length < 3 || this.gamer_tag.length > 40)) return false;
    if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) return false;
    if (this.password && this.password.length < 8) return false;
    return true;
  }
}