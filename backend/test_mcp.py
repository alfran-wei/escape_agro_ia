import asyncio
import os
import sys

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    params = StdioServerParameters(
        command=sys.executable,
        args=["-m", "app.mcp_server"],
        env={**os.environ, "PYTHONPATH": "."},
    )

    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            result = await session.list_tools()
            print("OUTILS MCP DISPONIBLES :")
            for tool in result.tools:
                print("-", tool.name)

            print("\nTEST DE L'OUTIL METEO :")
            weather = await session.call_tool(
                "get_weather_risk_tool",
                {"zone": "Estuaire", "period_days": 7},
            )
            print(weather)

            print("\nTEST DU MODULE COMMERCIAL :")
            sales = await session.call_tool(
                "compare_cassava_markets_tool",
                {"stock_kg": 5000},
            )

            for item in sales.content:
                if getattr(item, "text", None):
                    print(item.text)

            print("\nTEST DE LA SITUATION DU STOCK :")
            stock = await session.call_tool(
            "assess_cassava_stock_tool",
            {
            "stock_kg": 5000,
            "harvest_age_days": 2,
            "condition": "bon",
            "storage_conditions": "Stockage declare au sec",
            "urgency": "elevee",
                "target_sale_days": 2,
            "constraints": "Transport a organiser",
            },
            )
            for item in stock.content:
                if getattr(item, "text", None):
                    print(item.text)

            print("\nTEST DE LA PLANIFICATION COMMERCIALE :")
            plan = await session.call_tool(
            "plan_cassava_sales_tool",
            {"stock_kg": 5000},
            )

            for item in plan.content:
                if getattr(item, "text", None):
                    print(item.text)



if __name__ == "__main__":
    asyncio.run(main())
