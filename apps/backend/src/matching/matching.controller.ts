import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Matching")
@Controller("matching")
export class MatchingController {
  @Get("health")
  health() {
    return {
      status: "stub",
      message: "Matching engine is a placeholder in MVP"
    };
  }
}
